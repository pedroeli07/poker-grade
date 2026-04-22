"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { emptyGovernanceAlertForm } from "@/lib/constants/team/governance-form-defaults";
import type { GovernanceAlertRuleDTO } from "@/lib/data/team/governance-page";
import type { GovernanceAlertFormState } from "@/lib/types/team/governance-forms";
import { alertRuleDtoToForm, buildTeamAlertRuleUpsert } from "@/lib/utils/team/governance-entity-forms";
import { upsertTeamAlertRule } from "@/lib/queries/db/team/alerts/save-alert";
import { deleteTeamAlertRule } from "@/lib/queries/db/team/alerts/delete-alert";

export function useGovernanceAlertRules(alertRules: GovernanceAlertRuleDTO[]) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertForm, setAlertForm] = useState<GovernanceAlertFormState>(() => emptyGovernanceAlertForm());
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [deleteAlertId, setDeleteAlertId] = useState<string | null>(null);

  const rules = useMemo(() => alertRules, [alertRules]);

  const openNewAlert = useCallback(() => {
    setEditingAlertId(null);
    setAlertForm(emptyGovernanceAlertForm());
    setAlertOpen(true);
  }, []);

  const openEditAlert = useCallback((rule: GovernanceAlertRuleDTO) => {
    setEditingAlertId(rule.id);
    setAlertForm(alertRuleDtoToForm(rule));
    setAlertOpen(true);
  }, []);

  const saveAlert = useCallback(() => {
    if (
      !alertForm.name?.trim() ||
      alertForm.threshold === undefined ||
      Number.isNaN(alertForm.threshold)
    ) {
      toast.error("Preencha nome e limite numérico.");
      return;
    }
    const payload = buildTeamAlertRuleUpsert(alertForm, editingAlertId);
    start(async () => {
      const r = await upsertTeamAlertRule(payload);
      if (r.ok) {
        toast.success(editingAlertId ? "Regra atualizada." : "Regra criada.");
        setAlertOpen(false);
        router.refresh();
      } else toast.error(r.error || "Falha ao salvar regra.");
    });
  }, [alertForm, editingAlertId, router, start]);

  const confirmDeleteAlert = useCallback(() => {
    if (!deleteAlertId) return;
    start(async () => {
      const r = await deleteTeamAlertRule(deleteAlertId);
      if (r.ok) {
        toast.success("Regra removida.");
        setDeleteAlertId(null);
        router.refresh();
      } else toast.error(r.error || "Falha ao excluir.");
    });
  }, [deleteAlertId, router, start]);

  return {
    rules,
    pending,
    alertOpen,
    setAlertOpen,
    alertForm,
    setAlertForm,
    editingAlertId,
    openNewAlert,
    openEditAlert,
    saveAlert,
    deleteAlertId,
    setDeleteAlertId,
    confirmDeleteAlert,
  };
}
