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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  INDICATOR_AUTO_ACTION_OPTIONS,
  INDICATOR_DATA_SOURCE_OPTIONS,
  INDICATOR_FREQUENCY_OPTIONS,
  INDICATOR_RESULT_TYPE_OPTIONS,
} from "@/lib/constants/team/indicators-catalog-ui";
import type { TeamIndicatorFormState } from "@/lib/types/team/indicator-forms";
import type { StaffSelectOption } from "@/lib/utils/team/staff-select-options-merge";
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

function withExtraOption(list: readonly string[], current: string): string[] {
  const base = [...list];
  if (current && !base.includes(current)) base.push(current);
  return base;
}

export type IndicatorFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  form: TeamIndicatorFormState;
  onFormChange: (fn: (prev: TeamIndicatorFormState) => TeamIndicatorFormState) => void;
  onSave: () => void;
  pending: boolean;
  staff: StaffSelectOption[];
};

const IndicatorFormDialog = memo(function IndicatorFormDialog({
  open,
  onOpenChange,
  editingId,
  form,
  onFormChange,
  onSave,
  pending,
  staff,
}: IndicatorFormDialogProps) {
  const isEdit = Boolean(editingId);

  const dataSourceOptions = useMemo(
    () => withExtraOption(INDICATOR_DATA_SOURCE_OPTIONS, form.dataSource),
    [form.dataSource],
  );

  const driSelectValue = useMemo(() => {
    const id = form.authUserId ?? "";
    if (id && staff.some((s) => s.id === id)) return id;
    return "";
  }, [form.authUserId, staff]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,880px)] gap-0 overflow-y-auto p-0 sm:max-w-4xl">
        <div className="px-6 pt-6 pb-1">
          <DialogHeader className="space-y-1 p-0 text-left">
            <DialogTitle className="text-lg font-bold tracking-tight sm:text-xl">
              {isEdit ? "Editar indicador" : "Adicionar indicador"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Definição, meta, fonte de dados, DRI e ação automática (catálogo administrativo).
            </p>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 pb-6">
          <div className="space-y-2">
            <FieldLabel required>Nome</FieldLabel>
            <Input
              className={fieldCls}
              value={form.name}
              onChange={(e) => onFormChange((p) => ({ ...p, name: e.target.value }))}
              autoComplete="off"
              placeholder="Ex.: ROI Médio 7d"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="min-w-0 space-y-2">
              <FieldLabel required>Tipo</FieldLabel>
              <Select
                value={form.resultType}
                onValueChange={(v) => onFormChange((p) => ({ ...p, resultType: v }))}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDICATOR_RESULT_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-2">
              <FieldLabel>Frequência</FieldLabel>
              <Select
                value={form.frequency}
                onValueChange={(v) => onFormChange((p) => ({ ...p, frequency: v }))}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDICATOR_FREQUENCY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-2">
              <FieldLabel required>Fonte</FieldLabel>
              <Select
                value={form.dataSource}
                onValueChange={(v) => onFormChange((p) => ({ ...p, dataSource: v }))}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataSourceOptions.map((src) => (
                    <SelectItem key={src} value={src}>
                      {src}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-2">
              <FieldLabel>Ação automática</FieldLabel>
              <Select
                value={form.autoAction}
                onValueChange={(v) => onFormChange((p) => ({ ...p, autoAction: v }))}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDICATOR_AUTO_ACTION_OPTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Fórmula/Definição</FieldLabel>
            <Textarea
              className={cn(fieldCls, "min-h-[88px] py-2")}
              value={form.definition}
              onChange={(e) => onFormChange((p) => ({ ...p, definition: e.target.value }))}
              placeholder="Como o indicador é calculado"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel required>Responsável (DRI)</FieldLabel>
            <Select
              value={driSelectValue}
              onValueChange={(id) =>
                onFormChange((p) => {
                  const s = staff.find((x) => x.id === id);
                  return { ...p, authUserId: id, responsibleName: s?.name ?? "" };
                })
              }
            >
              <SelectTrigger className={selectTriggerCls}>
                <SelectValue placeholder="Atribuir a…" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <FieldLabel>Valor da meta</FieldLabel>
              <Input
                type="number"
                step="any"
                className={fieldCls}
                value={Number.isNaN(form.targetValue) ? "" : form.targetValue}
                onChange={(e) =>
                  onFormChange((p) => ({
                    ...p,
                    targetValue: e.target.value === "" ? NaN : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <FieldLabel>Unidade</FieldLabel>
              <Input
                className={fieldCls}
                value={form.unit}
                onChange={(e) => onFormChange((p) => ({ ...p, unit: e.target.value }))}
                placeholder="%, $, torneios…"
              />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <FieldLabel>Área</FieldLabel>
              <Input
                className={fieldCls}
                value={form.area}
                onChange={(e) => onFormChange((p) => ({ ...p, area: e.target.value }))}
                placeholder="Geral"
              />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Link (opcional)</FieldLabel>
            <Input
              className={fieldCls}
              value={form.sourceUrl}
              onChange={(e) => onFormChange((p) => ({ ...p, sourceUrl: e.target.value }))}
              placeholder="https://…"
              inputMode="url"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Glossário (opcional)</FieldLabel>
            <Textarea
              className={cn(fieldCls, "min-h-[72px] py-2")}
              value={form.glossary}
              onChange={(e) => onFormChange((p) => ({ ...p, glossary: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="button" onClick={onSave} disabled={pending}>
              {pending ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar indicador"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

IndicatorFormDialog.displayName = "IndicatorFormDialog";

export default IndicatorFormDialog;
