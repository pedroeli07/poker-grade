import type { Dispatch, SetStateAction } from "react";
export type GovernanceDecisionFormState = {
  title: string;
  summary: string;
  impact: string;
  area: string;
  status: string;
  visibility: string;
  tagsText: string;
  decidedAtLocal: string;
};

export type GovernanceAlertFormState = {
  name: string;
  area: string;
  metric: string;
  operator: string;
  threshold: number;
  severity: string;
  authUserId: string | null;
  responsibleName: string | null;
};

export type GovernanceAlertRuleFormDialogProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editingId: string | null;
  form: GovernanceAlertFormState;
  onFormChange: Dispatch<SetStateAction<GovernanceAlertFormState>>;
  onSave: () => void;
  pending: boolean;
};

export type GovernanceDeleteDialogsProps = {
  deleteDecisionId: string | null;
  onDeleteDecisionIdChange: (id: string | null) => void;
  onConfirmDeleteDecision: () => void;
  deleteAlertId: string | null;
  onDeleteAlertIdChange: (id: string | null) => void;
  onConfirmDeleteAlert: () => void;
};
