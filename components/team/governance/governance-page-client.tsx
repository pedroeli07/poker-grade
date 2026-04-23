"use client";

import { useGovernancePage } from "@/hooks/team/use-governance-page";
import { useGovernanceAlertRules } from "@/hooks/team/use-governance-alert-rules";
import type { GovernancePageData } from "@/lib/data/team/governance-page";
import GovernanceEditDriModal from "./governance-edit-dri-modal";
import GovernanceDecisionDialog from "./governance-decision-dialog";
import { GovernanceConfirmDeleteDialog } from "./governance-confirm-delete-dialog";
import { GovernancePageHeader } from "./governance-page-header";
import { GovernanceDriMatrixSection } from "./governance-dri-matrix-section";
import { GovernanceFlowSection } from "./governance-flow-section";
import { GovernanceHistoricalSection } from "./governance-historical-section";
import { GovernanceAlertRulesSection } from "./governance-alert-rules-section";
import GovernancePageWithTabs from "./governance-page-with-tabs";
import GovernanceAlertRuleFormDialog from "./governance-alert-rule-form-dialog";
import GovernanceDeleteDialogs from "./governance-delete-dialogs";


export default function GovernancePageClient({ dris, decisions, staff, alertRules }: GovernancePageData) {
  const {
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
    deletePending,
  } = useGovernancePage({ dris, decisions, staff, alertRules });

  const {
    rules,
    pending: alertPending,
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
  } = useGovernanceAlertRules(alertRules);

  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-6">
      <GovernancePageHeader onNewDecision={openNewDecision} />

      <GovernancePageWithTabs
        matrizDri={
          <div className="space-y-4">
            <GovernanceDriMatrixSection
              dris={dris}
              onConfigure={() => {
                setSelectedDri(null);
                setDriModalOpen(true);
              }}
              onEdit={(d) => {
                setSelectedDri(d);
                setDriModalOpen(true);
              }}
              onRequestDelete={setDriToDelete}
            />
          </div>
        }
        fluxo={<GovernanceFlowSection />}
        historico={
          <div className="space-y-4">
            <GovernanceHistoricalSection
              decisions={decisions}
              onEditDecision={openEditDecision}
              onRequestDeleteDecision={setDecisionToDelete}
            />
          </div>
        }
        regrasAlerta={
          <div className="space-y-4">
            <GovernanceAlertRulesSection
              rules={rules}
              onNew={openNewAlert}
              onEdit={openEditAlert}
              onRequestDelete={setDeleteAlertId}
            />
          </div>
        }
      />

      <GovernanceEditDriModal
        key={selectedDri?.id ?? "new-dri"}
        open={driModalOpen}
        onOpenChange={setDriModalOpen}
        dri={selectedDri}
        staff={staff}
      />
      <GovernanceDecisionDialog
        key={editingDecisionId ?? "new-decision"}
        open={decisionOpen}
        onOpenChange={(o) => {
          setDecisionOpen(o);
          if (!o) {
            setEditingDecisionId(null);
            setSelectedDecision(null);
          }
        }}
        editingId={editingDecisionId}
        initial={selectedDecision}
      />
      <GovernanceConfirmDeleteDialog
        open={!!decisionToDelete}
        title="Excluir decisão?"
        description={
          <p>Esta decisão será removida do histórico de deliberações.</p>
        }
        onConfirm={handleDeleteDecisao}
        onCancel={() => setDecisionToDelete(null)}
        confirmPending={deletePending}
      />
      <GovernanceConfirmDeleteDialog
        open={!!driToDelete}
        title="Excluir área DRI?"
        description={
          <p>
            A área DRI{" "}
            <span className="font-semibold text-foreground">{driAreaName ?? "—"}</span> será excluída.
          </p>
        }
        onConfirm={handleDeleteDRI}
        onCancel={() => setDriToDelete(null)}
        confirmPending={deletePending}
      />

      <GovernanceAlertRuleFormDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        editingId={editingAlertId}
        form={alertForm}
        onFormChange={setAlertForm}
        onSave={saveAlert}
        pending={alertPending}
      />
      <GovernanceDeleteDialogs
        deleteAlertId={deleteAlertId}
        onDeleteAlertIdChange={setDeleteAlertId}
        onConfirmDeleteAlert={confirmDeleteAlert}
        deleteAlertRuleName={
          deleteAlertId ? (rules.find((r) => r.id === deleteAlertId)?.name ?? null) : null
        }
        confirmPending={alertPending}
      />
    </div>
  );
}
