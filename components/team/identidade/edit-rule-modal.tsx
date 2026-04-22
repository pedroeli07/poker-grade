"use client";

import { memo, useState, useTransition, type ComponentProps } from "react";
import { Edit2, Plus } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import { EMPTY_RULE_FORM, META_FIELDS, TIPO_OPTIONS } from "@/lib/constants/team/identity";
import { SEVERITY_OPTIONS } from "@/lib/constants/team/severity";
import { type RuleType } from "@/lib/constants/team/rule-type";
import { upsertTeamOperationalRule } from "@/lib/queries/db/team/culture/save-rule";

type RuleData = typeof EMPTY_RULE_FORM & { id?: string };

type TriggerProps = {
  label: string;
  icon: "plus" | "edit";
} & Pick<ComponentProps<typeof Button>, "variant" | "size" | "className">;

type Props = {
  initialData?: Partial<RuleData> | null;
  /** Rendered inside the client tree so Radix DialogTrigger + Button hydrate consistently. */
  trigger: TriggerProps;
};

const EditRuleModal = memo(function EditRuleModal({ initialData, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RuleData>({ ...EMPTY_RULE_FORM, ...(initialData ?? {}) });
  const [pending, startTransition] = useTransition();

  const handleOpenChange = (next: boolean) => {
    if (next) setForm({ ...EMPTY_RULE_FORM, ...(initialData ?? {}) });
    setOpen(next);
  };

  const set = <K extends keyof RuleData>(k: K, v: RuleData[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Informe um título.");
      return;
    }
    startTransition(async () => {
      const res = await upsertTeamOperationalRule({
        id: initialData?.id,
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        monitoring: form.monitoring,
        severity: form.severity,
        source: form.source.trim(),
        limit: form.limit.trim(),
        consequence: form.consequence.trim(),
      });
      if (res.ok) {
        toast.success(initialData?.id ? "Regra atualizada." : "Regra criada.");
        setOpen(false);
      } else {
        toast.error(res.error || "Erro ao salvar.");
      }
    });
  };

  const TriggerIcon = trigger.icon === "plus" ? Plus : Edit2;
  const iconClassName =
    trigger.icon === "plus" ? "w-4 h-4" : "w-3.5 h-3.5 mr-1";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size={trigger.size ?? "sm"}
          variant={trigger.variant ?? "default"}
          className={trigger.className}
        >
          <TriggerIcon className={iconClassName} />
          {trigger.label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Editar regra" : "Nova regra operacional"}</DialogTitle>
          <DialogDescription>
            Defina uma regra que norteia a operação e a cultura do time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              placeholder="ex.: Reporte diário"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex gap-2">
              {TIPO_OPTIONS.map(({ value, label, icon: Icon, active }) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  onClick={() => set("type", value as RuleType)}
                  className={cn("flex-1 h-10", form.type === value && active)}
                >
                  <Icon className="w-4 h-4 mr-2" /> {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Por que existe?</Label>
            <Textarea
              placeholder="Descreva o racional por trás desta regra..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
            <div>
              <p className="text-sm font-semibold">Monitoramento automático</p>
              <p className="text-xs text-muted-foreground">
                Indica que o sistema acompanha esta regra automaticamente.
              </p>
            </div>
            <Switch
              checked={form.monitoring}
              onCheckedChange={(v) => set("monitoring", v)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Grau</Label>
              <Select value={form.severity} onValueChange={(v) => set("severity", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {META_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  {label}
                </Label>
                <Input
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Consequência</Label>
            <Textarea
              placeholder="O que acontece se a regra for violada..."
              value={form.consequence}
              onChange={(e) => set("consequence", e.target.value)}
              className="min-h-16"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default EditRuleModal;
