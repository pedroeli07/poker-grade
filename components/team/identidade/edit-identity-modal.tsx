"use client";

import { memo, useEffect, useRef, useState, useTransition, type ComponentProps } from "react";
import { Edit2, GripVertical, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { TeamCulture } from "@prisma/client";
import type { TeamCultureValue } from "@/lib/types/team/identity";
import { EMPTY_VALOR, SECTION_CONFIG } from "@/lib/constants/team/identity";
import { updateTeamCulture } from "@/lib/queries/db/team/culture/update-culture";
import { cn } from "@/lib/utils/cn";

const MAX_VALORES = 10;
const WIZARD_STEPS = 4;
const VALUES_STEP = 3;

type TriggerProps = {
  label: string;
} & Pick<ComponentProps<typeof Button>, "variant" | "className">;

type Props = {
  initialData: TeamCulture | null;
  /** Rendered inside the client tree so Radix DialogTrigger + Button hydrate consistently. */
  trigger: TriggerProps;
};

function parseCultureValues(v: unknown): TeamCultureValue[] {
  return Array.isArray(v) ? (v as TeamCultureValue[]) : [];
}

const EditIdentityModal = memo(function EditIdentityModal({ initialData, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState(initialData?.purpose ?? "");
  const [vision, setVision] = useState(initialData?.vision ?? "");
  const [mission, setMission] = useState(initialData?.mission ?? "");
  const [valores, setValores] = useState<TeamCultureValue[]>(parseCultureValues(initialData?.values));
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setStep(0);
      setPurpose(initialData?.purpose ?? "");
      setVision(initialData?.vision ?? "");
      setMission(initialData?.mission ?? "");
      setValores(parseCultureValues(initialData?.values));
    }
    setOpen(next);
  };

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, open]);

  const stateMap: Record<string, [string, (v: string) => void]> = {
    purpose: [purpose, setPurpose],
    vision: [vision, setVision],
    mission: [mission, setMission],
  };

  const updateValor = <K extends keyof TeamCultureValue>(
    i: number,
    field: K,
    value: TeamCultureValue[K],
  ) =>
    setValores((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });

  const updateMetrica = (
    vIdx: number,
    mIdx: number,
    field: "title" | "description" | "source",
    value: string,
  ) =>
    setValores((prev) => {
      const next = [...prev];
      const rows = [...(next[vIdx].metrics ?? [])];
      rows[mIdx] = { ...rows[mIdx], [field]: value };
      next[vIdx] = { ...next[vIdx], metrics: rows };
      return next;
    });

  const addMetrica = (vIdx: number) =>
    setValores((prev) => {
      const next = [...prev];
      next[vIdx] = {
        ...next[vIdx],
        metrics: [...(next[vIdx].metrics ?? []), { title: "", description: "", source: "" }],
      };
      return next;
    });

  const removeMetrica = (vIdx: number, mIdx: number) =>
    setValores((prev) => {
      const next = [...prev];
      next[vIdx] = {
        ...next[vIdx],
        metrics: (next[vIdx].metrics ?? []).filter((_, i) => i !== mIdx),
      };
      return next;
    });

  const handleNext = () => {
    if (step === 0 && !purpose.trim()) {
      toast.error("Preencha o propósito antes de continuar.");
      return;
    }
    if (step === 1 && !vision.trim()) {
      toast.error("Preencha a visão antes de continuar.");
      return;
    }
    if (step === 2 && !mission.trim()) {
      toast.error("Preencha a missão antes de continuar.");
      return;
    }
    if (step < VALUES_STEP) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateTeamCulture({
        purpose,
        vision,
        mission,
        values: valores as unknown as never,
      });
      if (res.ok) {
        toast.success("Identidade salva.");
        setOpen(false);
      } else {
        toast.error(res.error || "Erro ao salvar.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant={trigger.variant ?? "default"}
          className={trigger.className}
        >
          <Edit2 className="w-3.5 h-3.5" />
          {trigger.label}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex w-[min(100vw-1.5rem,48rem)] max-w-3xl flex-col gap-0 p-0 sm:max-w-3xl",
          step === VALUES_STEP
            ? "max-h-[min(95vh,58rem)]"
            : "max-h-[min(90vh,52rem)]",
        )}
        showCloseButton
      >
        <div className="shrink-0 space-y-1 border-b bg-popover px-4 py-3 sm:px-6 sm:py-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle>Editar identidade do time</DialogTitle>
            <DialogDescription className="text-balance">
              {step < VALUES_STEP
                ? "Complete cada etapa em ordem: propósito, visão, missão e, por fim, os valores."
                : "Valores traduzem a cultura em comportamentos e métricas verificáveis."}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm font-medium text-primary">
            Passo {step + 1} de {WIZARD_STEPS}
            {step < VALUES_STEP
              ? ` — ${SECTION_CONFIG[step].label}`
              : " — Valores"}
          </p>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4 sm:px-6"
        >
          {step < VALUES_STEP && (
            <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
              {(() => {
                const section = SECTION_CONFIG[step];
                const [val, setVal] = stateMap[section.key];
                const Icon = section.icon;
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold uppercase tracking-wide">
                        {section.label}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">Obrigatório</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                    <Textarea
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                      className="min-h-32"
                      placeholder={`Descreva o ${section.label.toLowerCase()} do time...`}
                    />
                  </>
                );
              })()}
            </div>
          )}

          {step === VALUES_STEP && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
                  <Star className="h-4 w-4" /> Valores
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(valores.length / MAX_VALORES) * 100}
                    className="h-1.5 w-32"
                  />
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {valores.length}/{MAX_VALORES}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {valores.map((v, idx) => (
                  <div key={idx} className="rounded-xl border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center pt-1.5 text-muted-foreground">
                        <GripVertical className="h-4 w-4 opacity-50" />
                        <span className="mt-1 text-xs font-bold tabular-nums">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 space-y-3">
                        <Input
                          placeholder="Nome do valor..."
                          value={v.title}
                          onChange={(e) => updateValor(idx, "title", e.target.value)}
                        />
                        <Textarea
                          placeholder="Como vivemos este valor no dia a dia..."
                          value={v.description}
                          onChange={(e) => updateValor(idx, "description", e.target.value)}
                          className="min-h-16"
                        />
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <Label className="text-[10px] uppercase tracking-wider text-emerald-700">
                              O que fazemos
                            </Label>
                            <Textarea
                              placeholder="Item 1\nItem 2..."
                              value={v.whatWeDo ?? ""}
                              onChange={(e) => updateValor(idx, "whatWeDo", e.target.value)}
                              className="mt-1 min-h-36 resize-y border-l-2 border-l-emerald-500"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] uppercase tracking-wider text-rose-700">
                              O que NÃO fazemos
                            </Label>
                            <Textarea
                              placeholder="Item 1\nItem 2..."
                              value={v.whatWeDont ?? ""}
                              onChange={(e) => updateValor(idx, "whatWeDont", e.target.value)}
                              className="mt-1 min-h-36 resize-y border-l-2 border-l-rose-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Métricas do sistema
                          </Label>
                          <div className="space-y-2">
                            {(v.metrics ?? []).map((m, mIdx) => (
                              <div
                                key={mIdx}
                                className="flex items-start gap-2 rounded-lg bg-muted/40 p-2"
                              >
                                <div className="grid flex-1 grid-cols-3 gap-2">
                                  <Input
                                    placeholder="Métrica"
                                    className="h-8 text-xs"
                                    value={m.title}
                                    onChange={(e) =>
                                      updateMetrica(idx, mIdx, "title", e.target.value)
                                    }
                                  />
                                  <Input
                                    placeholder="Descrição"
                                    className="h-8 text-xs"
                                    value={m.description}
                                    onChange={(e) =>
                                      updateMetrica(idx, mIdx, "description", e.target.value)
                                    }
                                  />
                                  <Input
                                    placeholder="Fonte"
                                    className="h-8 text-xs"
                                    value={m.source}
                                    onChange={(e) =>
                                      updateMetrica(idx, mIdx, "source", e.target.value)
                                    }
                                  />
                                </div>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeMetrica(idx, mIdx)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 w-full text-xs"
                              onClick={() => addMetrica(idx)}
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" /> Nova métrica
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setValores((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    valores.length < MAX_VALORES && setValores((prev) => [...prev, { ...EMPTY_VALOR }])
                  }
                  disabled={valores.length >= MAX_VALORES}
                >
                  <Plus className="mr-1 h-4 w-4" /> Adicionar valor
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-9 min-w-0 sm:flex-1">
              {step > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={pending}
                  className="w-full sm:w-auto"
                >
                  Voltar
                </Button>
              )}
            </div>
            <div className="flex flex-1 flex-wrap justify-end gap-2 sm:flex-none">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              {step < VALUES_STEP ? (
                <Button type="button" onClick={handleNext} disabled={pending}>
                  Próximo
                </Button>
              ) : (
                <Button type="button" onClick={handleSave} disabled={pending}>
                  {pending ? "Salvando..." : "Salvar alterações"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default EditIdentityModal;
