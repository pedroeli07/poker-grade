"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Info, Pencil, Loader2 } from "lucide-react";
import { updateGradeCoachNote } from "@/app/dashboard/grades/actions";
import { toast } from "@/lib/toast";
import { gradeKeys } from "@/lib/queries/grade-query-keys";

export function GradeCoachNoteSection({
  gradeId,
  initialDescription,
  canEdit,
}: {
  gradeId: string;
  initialDescription: string | null;
  canEdit: boolean;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(initialDescription ?? "");
  const [pending, startTransition] = useTransition();

  const display = initialDescription?.trim();
  const showSection = Boolean(display) || canEdit;

  if (!showSection) return null;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setText(initialDescription ?? "");
  }

  function save() {
    startTransition(async () => {
      const res = await updateGradeCoachNote(gradeId, text.trim() === "" ? null : text);
      if (!res.ok) {
        toast.error("Não foi possível salvar", res.error);
        return;
      }
      toast.success("Nota do coach atualizada");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: gradeKeys.detail(gradeId) });
      void qc.invalidateQueries({ queryKey: gradeKeys.list() });
    });
  }

  return (
    <>
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/8 p-5 sm:p-6 flex gap-4 sm:gap-5">
        <div className="shrink-0 mt-0.5">
          <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="min-w-0 flex-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-blue-600 mb-1.5">
              Nota do Coach
            </p>
            {display ? (
              <p className="text-[15px] text-blue-600/80 leading-relaxed whitespace-pre-line">
                {initialDescription}
              </p>
            ) : canEdit ? (
              <p className="text-[15px] text-blue-600/60 italic">
                Nenhuma nota ainda. Use Editar para adicionar.
              </p>
            ) : null}
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-blue-500/35 text-blue-700 bg-white/60 hover:bg-blue-500/10"
              onClick={() => setOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar nota do coach</DialogTitle>
          </DialogHeader>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Orientações sobre a grade, exceções, contexto para o jogador…"
            className="min-h-[160px] text-sm resize-y"
            maxLength={2000}
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground text-right tabular-nums">
            {text.length}/2000
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={save} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
