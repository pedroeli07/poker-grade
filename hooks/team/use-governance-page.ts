"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteTeamDecision } from "@/lib/queries/db/team/governance/delete-decision";
import { deleteTeamDri } from "@/lib/queries/db/team/governance/delete-dri";
import type { GovernanceDriDTO, GovernancePageData } from "@/lib/data/team/governance-page";
import type { GovernanceDecisionDTO } from "@/lib/data/team/governance-page";

export function useGovernancePage({ dris, decisions: _decisions, staff, alertRules: _alertRules }: GovernancePageData) {
  const router = useRouter();
  const [driModalOpen, setDriModalOpen] = useState(false);
  const [selectedDri, setSelectedDri] = useState<GovernanceDriDTO | null>(null);
  const [driToDelete, setDriToDelete] = useState<string | null>(null);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [editingDecisionId, setEditingDecisionId] = useState<string | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<GovernanceDecisionDTO | null>(null);
  const [decisionToDelete, setDecisionToDelete] = useState<string | null>(null);
  const [, startDel] = useTransition();

  const handleDeleteDRI = useCallback(() => {
    if (!driToDelete) return;
    const id = driToDelete;
    startDel(async () => {
      const r = await deleteTeamDri(id);
      if (r.ok) {
        toast.success("Área DRI excluída.");
        setDriToDelete(null);
        router.refresh();
      } else toast.error(r.error || "Erro ao excluir.");
    });
  }, [driToDelete, router, startDel]);

  const handleDeleteDecisao = useCallback(() => {
    if (!decisionToDelete) return;
    const id = decisionToDelete;
    startDel(async () => {
      const r = await deleteTeamDecision(id);
      if (r.ok) {
        toast.success("Decisão excluída.");
        setDecisionToDelete(null);
        router.refresh();
      } else toast.error(r.error || "Erro ao excluir.");
    });
  }, [decisionToDelete, router, startDel]);

  const openNewDecision = useCallback(() => {
    setEditingDecisionId(null);
    setSelectedDecision(null);
    setDecisionOpen(true);
  }, []);

  const openEditDecision = useCallback((d: GovernanceDecisionDTO) => {
    setEditingDecisionId(d.id);
    setSelectedDecision(d);
    setDecisionOpen(true);
  }, []);

  const driAreaName = dris.find((d) => d.id === driToDelete)?.area;

  return {
    dris,
    staff,
    driModalOpen,
    setDriModalOpen,
    selectedDri,
    setSelectedDri,
    driToDelete,
    setDriToDelete,
    decisionOpen,
    setDecisionOpen,
    editingDecisionId,
    setEditingDecisionId,
    selectedDecision,
    setSelectedDecision,
    decisionToDelete,
    setDecisionToDelete,
    handleDeleteDRI,
    handleDeleteDecisao,
    openNewDecision,
    openEditDecision,
    driAreaName,
  };
}
