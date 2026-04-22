"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteTeamRitual } from "@/lib/queries/db/team/rituals/delete-ritual";
import { deleteTeamRitualExecution } from "@/lib/queries/db/team/rituals/delete-execution";
import type { RitualDTO, RitualsPageData } from "@/lib/data/team/rituals-page";

export function useRitualsPage({ rituals, staff }: RitualsPageData) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RitualDTO | null>(null);
  const [executing, setExecuting] = useState<RitualDTO | null>(null);
  const [deleting, setDeleting] = useState<RitualDTO | null>(null);
  const [deletePending, startDelete] = useTransition();
  const [undoPending, startUndo] = useTransition();

  const stats = useMemo(() => {
    const now = new Date();
    let overdue = 0;
    let scheduled = 0;
    let completed = 0;
    for (const r of rituals) {
      if (r.executions.length > 0) {
        completed++;
      } else if (new Date(r.startAt) < now) {
        overdue++;
      } else {
        scheduled++;
      }
    }
    const total = rituals.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { overdue, scheduled, completed, rate };
  }, [rituals]);

  const openNew = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((r: RitualDTO) => {
    setEditing(r);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleting) return;
    const id = deleting.id;
    startDelete(async () => {
      const res = await deleteTeamRitual(id);
      if (res.ok) {
        toast.success("Ritual excluído.");
        setDeleting(null);
      } else {
        toast.error(res.error || "Erro ao excluir.");
      }
    });
  }, [deleting, startDelete]);

  const handleUndo = useCallback(
    (r: RitualDTO) => {
      const last = r.executions[0];
      if (!last) return;
      if (!confirm("Desfazer a última execução deste ritual?")) return;
      startUndo(async () => {
        const res = await deleteTeamRitualExecution(last.id);
        if (res.ok) toast.success("Execução desfeita.");
        else toast.error(res.error || "Erro ao desfazer.");
      });
    },
    [startUndo],
  );

  return {
    staff,
    rituals,
    stats,
    formOpen,
    setFormOpen,
    editing,
    setEditing,
    executing,
    setExecuting,
    deleting,
    setDeleting,
    deletePending,
    undoPending,
    openNew,
    openEdit,
    handleDelete,
    handleUndo,
  };
}
