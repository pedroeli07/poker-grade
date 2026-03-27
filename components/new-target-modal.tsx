"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Target, Loader2, ChevronRight } from "lucide-react";
import { createTarget } from "@/app/dashboard/targets/actions";
import { toast } from "@/lib/toast";
import { isNextRedirectError } from "@/lib/utils";

type Player = { id: string; name: string; nickname: string | null };

interface NewTargetModalProps {
  players: Player[];
}

const CATEGORIES = [
  { value: "performance", label: "Performance (ROI, ABI, ITM)" },
  { value: "volume", label: "Volume (sessões, torneios)" },
  { value: "discipline", label: "Disciplina (grade, estudo)" },
  { value: "financial", label: "Financeiro (lucro, bankroll)" },
  { value: "qualitative", label: "Qualitativo (comportamento)" },
];

const LIMIT_ACTIONS = [
  { value: "none", label: "Sem ação associada" },
  { value: "UPGRADE", label: "Subida de limite" },
  { value: "MAINTAIN", label: "Manutenção" },
  { value: "DOWNGRADE", label: "Descida de limite" },
];

export function NewTargetModal({ players }: NewTargetModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [targetType, setTargetType] = useState("NUMERIC");
  const [category, setCategory] = useState("performance");
  const [limitAction, setLimitAction] = useState("none");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleOpenChange(value: boolean) {
    if (isPending) return;
    setOpen(value);
    if (!value) {
      setTimeout(() => {
        formRef.current?.reset();
        setPlayerId(players[0]?.id ?? "");
        setTargetType("NUMERIC");
        setCategory("performance");
        setLimitAction("none");
      }, 150);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("playerId", playerId);
    formData.set("targetType", targetType);
    formData.set("category", category);
    formData.set("limitAction", limitAction);

    startTransition(async () => {
      try {
        await createTarget(formData);
        toast.success("Target criado!", "A meta foi adicionada ao jogador.");
        handleOpenChange(false);
        router.refresh();
      } catch (err) {
        if (isNextRedirectError(err)) throw err;
        toast.error("Erro ao criar target", err instanceof Error ? err.message : "Tente novamente.");
      }
    });
  }

  return (
    <>
      <Button
        className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Novo Target
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-5 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <DialogHeader className="space-y-0.5">
                <DialogTitle className="text-base font-semibold">Novo Target</DialogTitle>
                <DialogDescription className="text-xs">
                  Defina uma meta mensurável para o jogador.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <Separator />

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Jogador */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Jogador <span className="text-destructive normal-case">*</span>
                </Label>
                <Select value={playerId} onValueChange={setPlayerId} disabled={isPending}>
                  <SelectTrigger className="w-full h-9 bg-muted/40 border-border/60">
                    <SelectValue placeholder="Selecione um jogador..." />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                        {p.nickname && (
                          <span className="ml-1.5 text-xs text-muted-foreground">@{p.nickname}</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nome do target */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Nome da Meta <span className="text-destructive normal-case">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Ex: ABI médio, ROI mínimo, Sessões por semana"
                  className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                  disabled={isPending}
                />
              </div>

              {/* Categoria + Tipo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Categoria
                  </Label>
                  <Select value={category} onValueChange={setCategory} disabled={isPending}>
                    <SelectTrigger className="w-full h-9 bg-muted/40 border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Tipo
                  </Label>
                  <Select value={targetType} onValueChange={setTargetType} disabled={isPending}>
                    <SelectTrigger className="w-full h-9 bg-muted/40 border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NUMERIC">Numérico</SelectItem>
                      <SelectItem value="TEXT">Texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campos numéricos */}
              {targetType === "NUMERIC" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="numericValue" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Valor Alvo
                    </Label>
                    <Input
                      id="numericValue"
                      name="numericValue"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="unit" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Unidade
                    </Label>
                    <Input
                      id="unit"
                      name="unit"
                      placeholder="$, %, sessões..."
                      className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="greenThreshold" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Limite Verde (≥)
                    </Label>
                    <Input
                      id="greenThreshold"
                      name="greenThreshold"
                      type="number"
                      step="0.01"
                      placeholder="On Track"
                      className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="yellowThreshold" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Limite Amarelo (≥)
                    </Label>
                    <Input
                      id="yellowThreshold"
                      name="yellowThreshold"
                      type="number"
                      step="0.01"
                      placeholder="Atenção"
                      className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                      disabled={isPending}
                    />
                  </div>
                </div>
              )}

              {/* Campo texto */}
              {targetType === "TEXT" && (
                <div className="space-y-1.5">
                  <Label htmlFor="textValue" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Valor / Descrição
                  </Label>
                  <Textarea
                    id="textValue"
                    name="textValue"
                    placeholder="Descreva a meta qualitativa..."
                    rows={2}
                    className="bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 resize-none"
                    disabled={isPending}
                  />
                </div>
              )}

              {/* Ação de limite associada */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Gatilho de Limite
                </Label>
                <Select value={limitAction} onValueChange={setLimitAction} disabled={isPending}>
                  <SelectTrigger className="w-full h-9 bg-muted/40 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LIMIT_ACTIONS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notas do coach */}
              <div className="space-y-1.5">
                <Label htmlFor="coachNotes" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Notas do Coach
                </Label>
                <Textarea
                  id="coachNotes"
                  name="coachNotes"
                  placeholder="Contexto, observações, critérios de avaliação..."
                  rows={2}
                  className="bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 resize-none"
                  disabled={isPending}
                />
              </div>
            </div>

            <Separator />

            <DialogFooter className="px-6 py-4 border-t-0 bg-muted/20">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="border-border/60"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !playerId}
                className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 min-w-[130px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    Criar Target
                    <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
