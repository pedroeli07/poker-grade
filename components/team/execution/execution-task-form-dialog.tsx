"use client";

import { memo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  EXEC_TAG_COLORS,
  EXECUTION_META_BADGE_SIZE,
  execTagStyle,
  TASK_PRIORITY_OPTIONS,
  type ExecTagColorName,
} from "@/lib/constants/team/execution-ui";
import { cn } from "@/lib/utils/cn";
import type { ExecutionTaskFormDialogProps } from "@/lib/types/team/execution";
import { RitualDatePickerField } from "@/components/team/rituals/ritual-date-time-fields";

export const ExecutionTaskFormDialog = memo(function ExecutionTaskFormDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSave,
  staff,
  pending,
}: ExecutionTaskFormDialogProps) {
  const [tagInput, setTagInput] = useState("");
  const [tagColorName, setTagColorName] = useState<ExecTagColorName>(EXEC_TAG_COLORS[0]!.name);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setTagInput("");
      setTagColorName(EXEC_TAG_COLORS[0]!.name);
    }
    onOpenChange(next);
  };

  const addTag = () => {
    const name = tagInput.trim();
    if (!name) return;
    onFormChange({
      tagEntries: [
        ...form.tagEntries,
        { id: `t-${Date.now()}`, label: name, colorName: tagColorName },
      ],
    });
    setTagInput("");
  };

  const removeTag = (id: string) => {
    onFormChange({ tagEntries: form.tagEntries.filter((e) => e.id !== id) });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[640px] border border-slate-200/80 shadow-2xl"
      >
        <div className="relative shrink-0 border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white px-6 pt-6 pb-5 pr-14">
          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
            {form.id ? "Editar tarefa" : "Criar Nova Tarefa"}
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-sm text-slate-500 leading-relaxed">
            Especifique os detalhes, tags e responsabilidades da ação.
          </DialogDescription>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-6 -mt-6">
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Informações básicas
            </h3>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600">
                Título da tarefa <span className="text-red-500">*</span>
              </Label>
              <Input
                className="h-10 rounded-lg border-slate-200"
                value={form.title}
                onChange={(e) => onFormChange({ title: e.target.value })}
                placeholder="O que precisa ser feito..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600">Descrição detalhada</Label>
              <Textarea
                className="min-h-[100px] rounded-lg border-slate-200 resize-y"
                value={form.description}
                onChange={(e) => onFormChange({ description: e.target.value })}
                placeholder="Contexto adicional..."
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Atributos e responsabilidades
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="min-w-0 space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">
                  Responsável (DRI) <span className="text-red-500">*</span>
                </Label>
                <Select value={form.authUserId} onValueChange={(v) => onFormChange({ authUserId: v })}>
                  <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 data-[placeholder]:text-slate-400">
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
              <div className="min-w-0 space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">
                  Prioridade <span className="text-red-500">*</span>
                </Label>
                <Select value={form.priority} onValueChange={(v) => onFormChange({ priority: v })}>
                  <SelectTrigger className="h-10 w-full rounded-lg border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0 space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">Prazo (deadline)</Label>
                <RitualDatePickerField
                  value={form.prazo}
                  onChange={(isoYmd) => onFormChange({ prazo: isoYmd })}
                  placeholder="Selecione a data"
                  triggerClassName="h-10 w-full min-w-0 rounded-lg border-slate-200 bg-white px-3 text-sm shadow-sm hover:bg-slate-50"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600">Critério de sucesso principal</Label>
              <Input
                className="h-10 rounded-lg border-slate-200"
                value={form.criterio}
                onChange={(e) => onFormChange({ criterio: e.target.value })}
                placeholder="Qual o entregável final?"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Custom tags</span>
              <Badge
                variant="secondary"
                className="h-5 rounded border-0 bg-sky-100 px-1.5 text-[10px] font-bold uppercase tracking-wide text-sky-800 shadow-none"
              >
                Novo
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-500">Nome da tag</Label>
                <Input
                  className="h-10 w-full rounded-lg border-slate-200"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Nome da tag"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="h-9 shrink-0 cursor-pointer rounded-lg font-semibold"
                  >
                    Adicionar tag
                  </Button>
                  <div
                    className="flex flex-1 flex-wrap items-center gap-1.5"
                    role="group"
                    aria-label="Cor da tag"
                  >
                    {EXEC_TAG_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        title={c.name}
                        onClick={() => setTagColorName(c.name)}
                        className={cn(
                          "h-7 w-7 shrink-0 cursor-pointer rounded-md border border-white/50 shadow-sm transition-transform hover:scale-105",
                          c.bg,
                          tagColorName === c.name
                            ? "ring-2 ring-slate-600 ring-offset-1"
                            : "ring-1 ring-slate-200/80",
                        )}
                      />
                    ))}
                  </div>
                </div>
                {form.tagEntries.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {form.tagEntries.map((tag) => {
                      const s = execTagStyle(tag.colorName);
                      return (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className={cn(
                            EXECUTION_META_BADGE_SIZE,
                            "inline-flex cursor-pointer items-center gap-0.5 pl-3 pr-1",
                            s.bg,
                            s.text,
                            s.border,
                          )}
                        >
                          {tag.label}
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-6 w-6 shrink-0 cursor-pointer p-0 text-current hover:bg-black/10"
                            onClick={() => removeTag(tag.id)}
                          >
                            ×
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-2 flex shrink-0 flex-col-reverse gap-2 border-t border-border/50 bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
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
            {form.id ? "Atualizar tarefa" : "Criar tarefa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ExecutionTaskFormDialog.displayName = "ExecutionTaskFormDialog";
