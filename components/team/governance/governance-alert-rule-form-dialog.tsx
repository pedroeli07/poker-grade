"use client";

import { memo, useMemo, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ALERT_AREA_OPTIONS,
  ALERT_METRIC_OPTIONS,
  ALERT_OPERATOR_OPTIONS,
  ALERT_RESPONSIBLE_ROLE_OPTIONS,
  ALERT_SEVERITY_FORM_OPTIONS,
} from "@/lib/constants/team/governance-mural-ui";
import type { GovernanceAlertRuleFormDialogProps } from "@/lib/types/team/governance-forms";
import { cn } from "@/lib/utils/cn";

const fieldCls =
  "h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm shadow-sm transition-[color,box-shadow] focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20";

const selectTriggerCls = cn(
  fieldCls,
  "flex items-center justify-between text-left data-placeholder:text-muted-foreground [&>span]:line-clamp-1",
);

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <Label className="text-sm font-semibold text-foreground">
      {children}
      {required ? <span className="text-destructive"> *</span> : null}
    </Label>
  );
}

function withLegacyOption(list: readonly string[], current: string): string[] {
  const base = [...list];
  if (current && !base.includes(current)) base.push(current);
  return base;
}

const FALLBACK_RESPONSIBLE_ROLE_OPTIONS = [
  "Gestor (admin)",
  "Financeiro",
  "Coach",
  "Head coach",
] as const;

function getResponsibleRoleBase(): readonly string[] {
  const o = ALERT_RESPONSIBLE_ROLE_OPTIONS;
  return o && o.length > 0 ? o : FALLBACK_RESPONSIBLE_ROLE_OPTIONS;
}

const GovernanceAlertRuleFormDialog = memo(function GovernanceAlertRuleFormDialog({
  open,
  onOpenChange,
  editingId,
  form,
  onFormChange,
  onSave,
  pending,
}: GovernanceAlertRuleFormDialogProps) {
  const isEdit = Boolean(editingId);

  const areaOptions = useMemo(
    () => withLegacyOption([...ALERT_AREA_OPTIONS], form.area),
    [form.area],
  );
  const metricOptions = useMemo(
    () => withLegacyOption([...ALERT_METRIC_OPTIONS], form.metric),
    [form.metric],
  );
  const responsibleOptions = useMemo(() => {
    const base = getResponsibleRoleBase();
    const n = form.responsibleName?.trim() || base[0] || "";
    return withLegacyOption([...base], n);
  }, [form.responsibleName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 sm:max-w-lg">
        <div className="px-6 pt-6 pb-1">
          <DialogHeader className="space-y-1 p-0 text-left">
            <DialogTitle className="text-lg font-bold tracking-tight sm:text-xl">
              {isEdit ? "Editar regra de alerta" : "Criar Regra de Alerta"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Defina gatilho numérico, área e quem acompanha o alerta.
            </p>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 pb-2">
          <div className="space-y-2">
            <FieldLabel required>Nome da regra</FieldLabel>
            <Input
              id="alert-rule-name"
              className={fieldCls}
              placeholder="Ex: Makeup alto"
              value={form.name}
              onChange={(e) => onFormChange((p) => ({ ...p, name: e.target.value }))}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-4">
            <div className="space-y-2">
              <FieldLabel required>Área</FieldLabel>
              <Select
                value={form.area}
                onValueChange={(v) => onFormChange((p) => ({ ...p, area: v }))}
              >
                <SelectTrigger id="alert-rule-area" className={selectTriggerCls}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {areaOptions.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel required>Métrica</FieldLabel>
              <Select
                value={form.metric}
                onValueChange={(v) => onFormChange((p) => ({ ...p, metric: v }))}
              >
                <SelectTrigger id="alert-rule-metric" className={selectTriggerCls}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <FieldLabel required>Operador</FieldLabel>
              <Select
                value={form.operator}
                onValueChange={(v) => onFormChange((p) => ({ ...p, operator: v }))}
              >
                <SelectTrigger id="alert-rule-op" className={selectTriggerCls}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ALERT_OPERATOR_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel required>Severidade</FieldLabel>
              <Select
                value={form.severity}
                onValueChange={(v) => onFormChange((p) => ({ ...p, severity: v }))}
              >
                <SelectTrigger id="alert-rule-sev" className={selectTriggerCls}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ALERT_SEVERITY_FORM_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <FieldLabel required>Responsável</FieldLabel>
              <Select
                value={
                  (form.responsibleName?.trim() || responsibleOptions[0] || "") as string
                }
                onValueChange={(v) =>
                  onFormChange((p) => ({
                    ...p,
                    authUserId: null,
                    responsibleName: v,
                  }))
                }
              >
                <SelectTrigger id="alert-rule-responsible" className={selectTriggerCls}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {responsibleOptions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel required>Limite</FieldLabel>
              <Input
                id="alert-rule-threshold"
                className={fieldCls}
                type="number"
                step="any"
                value={form.threshold}
                onChange={(e) =>
                  onFormChange((p) => ({ ...p, threshold: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-2 border-t border-border/50 bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-primary/50 bg-background font-semibold text-primary shadow-sm hover:bg-primary/10"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={pending}
            className="h-10 rounded-lg bg-primary px-6 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            {isEdit ? "Salvar alterações" : "Criar Regra"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

GovernanceAlertRuleFormDialog.displayName = "GovernanceAlertRuleFormDialog";

export default GovernanceAlertRuleFormDialog;
