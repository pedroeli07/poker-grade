"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { TeamIndicatorDTO } from "@/lib/data/team/indicators-page";
import type { StaffSelectOption } from "@/lib/utils/team/staff-select-options-merge";
import { resolveIndicatorFormAuthUserId } from "@/lib/utils/team/indicator-dri-resolve";
import {
  buildTeamIndicatorUpsert,
  emptyIndicatorForm,
  teamIndicatorDtoToForm,
  type TeamIndicatorFormState,
} from "@/lib/types/team/indicator-forms";
import { upsertTeamIndicator } from "@/lib/queries/db/team/indicators/save-indicator";
import { deleteTeamIndicator } from "@/lib/queries/db/team/indicators/delete-indicator";

export function useIndicatorsCatalog(
  initialIndicators: TeamIndicatorDTO[],
  staffOptions: StaffSelectOption[],
) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<TeamIndicatorFormState>(() => emptyIndicatorForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rows = useMemo(() => initialIndicators, [initialIndicators]);

  const openNew = useCallback(() => {
    setEditingId(null);
    const first = staffOptions[0];
    setForm({
      ...emptyIndicatorForm(),
      authUserId: first?.id ?? null,
      responsibleName: first?.name ?? "",
    });
    setFormOpen(true);
  }, [staffOptions]);

  const openEdit = useCallback(
    (row: TeamIndicatorDTO) => {
      setEditingId(row.id);
      const base = teamIndicatorDtoToForm(row);
      const authUserId = resolveIndicatorFormAuthUserId(row, staffOptions);
      setForm({ ...base, authUserId });
      setFormOpen(true);
    },
    [staffOptions],
  );

  const save = useCallback(() => {
    if (!form.name.trim()) {
      toast.error("Informe o nome do indicador.");
      return;
    }
    if (!Number.isFinite(form.targetValue)) {
      toast.error("Informe um valor numérico válido para a meta.");
      return;
    }
    if (!form.authUserId?.trim()) {
      toast.error("Selecione o responsável (DRI).");
      return;
    }
    const payload = buildTeamIndicatorUpsert(form, staffOptions);
    start(async () => {
      const r = await upsertTeamIndicator(payload);
      if (r.ok) {
        toast.success(editingId ? "Indicador atualizado." : "Indicador criado.");
        setFormOpen(false);
        router.refresh();
      } else toast.error(r.error || "Falha ao salvar indicador.");
    });
  }, [form, editingId, router, start, staffOptions]);

  const confirmDelete = useCallback(() => {
    if (!deleteId) return;
    start(async () => {
      const r = await deleteTeamIndicator(deleteId);
      if (r.ok) {
        toast.success("Indicador removido.");
        setDeleteId(null);
        router.refresh();
      } else toast.error(r.error || "Falha ao excluir.");
    });
  }, [deleteId, router, start]);

  return {
    rows,
    pending,
    formOpen,
    setFormOpen,
    form,
    setForm,
    editingId,
    openNew,
    openEdit,
    save,
    deleteId,
    setDeleteId,
    confirmDelete,
  };
}
