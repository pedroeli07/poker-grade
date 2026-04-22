"use client";

import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TASK_STATUS_COLUMNS, TASK_PRIORITY_OPTIONS } from "@/lib/constants/team/execution-ui";
import type { ExecutionTaskFormDialogProps } from "@/lib/types/team/execution";

export const ExecutionTaskFormDialog = memo(function ExecutionTaskFormDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSave,
  staff,
  pending,
}: ExecutionTaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{form.id ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
          <DialogDescription>Defina título, responsável e prazo; o status pode ser ajustado no cartão.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => onFormChange({ title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea
              className="min-h-24"
              value={form.description}
              onChange={(e) => onFormChange({ description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Responsável *</Label>
              <Select value={form.authUserId} onValueChange={(v) => onFormChange({ authUserId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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
            <div className="space-y-1.5">
              <Label>Prioridade *</Label>
              <Select value={form.priority} onValueChange={(v) => onFormChange({ priority: v })}>
                <SelectTrigger>
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
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Prazo</Label>
              <Input
                type="date"
                value={form.prazo}
                onChange={(e) => onFormChange({ prazo: e.target.value })}
              />
            </div>
            {form.id ? (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => onFormChange({ status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUS_COLUMNS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label>Critério de sucesso (principal)</Label>
            <Input
              value={form.criterio}
              onChange={(e) => onFormChange({ criterio: e.target.value })}
              placeholder="Entregável verificável"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tags (vírgula)</Label>
            <Input
              value={form.tagsText}
              onChange={(e) => onFormChange({ tagsText: e.target.value })}
              placeholder="ex.: grade, wbr"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={onSave} disabled={pending}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ExecutionTaskFormDialog.displayName = "ExecutionTaskFormDialog";
