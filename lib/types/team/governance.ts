import type { ReactNode } from "react";
import type { GovernanceDecisionDTO } from "@/lib/data/team/governance-page";
import type { GovernanceDriDTO, GovernanceStaffOption } from "@/lib/data/team/governance-page";

export type TeamDecisionUpsert = {
  id?: string;
  title: string;
  summary: string;
  impact: string;
  area: string;
  status: string;
  visibility: string;
  tags: string[];
  decidedAt?: Date;
};

export type TeamDecisionCreateInput = Omit<TeamDecisionUpsert, "id">;
export type TeamDecisionUpdateInput = TeamDecisionUpsert & { id: string };

/** TeamDri: registo único por `area` (ver schema). */
export type TeamDriCreateInput = {
  area: string;
  rules: string;
  authUserId: string | null;
  responsibleName: string | null;
};

export type TeamDriUpdateInput = TeamDriCreateInput & { id: string };

export type TeamDriUpsert = TeamDriCreateInput & { id?: string };

export type GovernanceDecisionDialogProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editingId: string | null;
  initial: GovernanceDecisionDTO | null;
};

export type GovernanceEditDriModalProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  dri: GovernanceDriDTO | null;
  staff: GovernanceStaffOption[];
};

export type GovernanceConfirmDeleteDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export type GovernanceDecisionCardProps = {
  decision: GovernanceDecisionDTO;
  onEdit: (d: GovernanceDecisionDTO) => void;
  onRequestDelete: (id: string) => void;
  areaIcon: ReactNode | null;
};
