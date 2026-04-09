import type { ComponentProps, ReactNode } from "react";
import type { CoachOpt, GradeOpt, PlayerRef, ModalProps } from "./primitives";
import type { GradeListRow } from "./gradeTypes";
import type { ImportListRow } from "./importTypes";
import type { Nick, PlayerTableRow } from "./playerTypes";
import type { ScoutingAnalysisRow } from "./sharkScopeTypes";
import type { UsuarioDirectoryRow } from "./userTypes";

export type UsuariosInviteModalProps = ModalProps;

export type RoleVisual = {
  label: string;
  text: string;
  bg: string;
  icon: ReactNode;
};

export type EditPlayerModalProps = ModalProps & {
  player: PlayerTableRow | null;
  coaches: CoachOpt[];
  grades: GradeOpt[];
  allowCoachSelect: boolean;
};

export interface PlayerNicksSectionProps {
  playerId: string;
  initialNicks: Nick[];
  canManage: boolean;
}

export type SharkscopeScoutingSavedCardProps = {
  analysis: ScoutingAnalysisRow;
  expanded: boolean;
  isPending: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export type PlayerDataRowProps = {
  player: PlayerTableRow;
  canEditPlayers: boolean;
  onEdit: (p: PlayerTableRow) => void;
};

export type PasswordStrengthProps = {
  password: string;
  className?: string;
  compact?: boolean;
};

export type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
  containerClassName?: string;
};

export type NewPlayerModalProps = {
  coaches: CoachOpt[];
  grades: GradeOpt[];
};

export interface NewTargetModalProps {
  players: PlayerRef[];
}

export interface ImportsTableRowProps {
  item: ImportListRow;
  canDelete: boolean;
  isSelected: boolean;
  isPending: boolean;
  onToggle: () => void;
  onDeleteRequest: () => void;
}

export interface GradeViewProps {
  grade: GradeListRow;
  manage: boolean;
}

export interface UserViewProps {
  row: UsuarioDirectoryRow;
  disabled: boolean;
  canManage: boolean;
  onAction: (
    fn: () => Promise<{ error?: string; success?: boolean }>,
    onSuccess?: () => void
  ) => void;
}

export type GradeCardProps = GradeViewProps;
export type GradeTableRowProps = GradeViewProps;
export type UserCardProps = UserViewProps;
export type UserTableRowProps = UserViewProps;
