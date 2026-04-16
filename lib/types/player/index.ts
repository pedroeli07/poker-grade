

/* =========================================================
   🔹 BASE TYPES
========================================================= */

import type { GradeType, PlayerStatus, Prisma, UserRole } from "@prisma/client";
import { playerProfileInclude } from "@/lib/constants/player";
import type { GradeAssignmentView } from "../grade";
import type {
  BaseEntity,
  CoachOpt,
  EntityRef,
  GradeOpt,
  ModalProps,
  WithIdAndStatus,
} from "../primitives";

type Option = { value: string; label: string };

type NullableNumber = number | null;

export type PlayerNameFields = {
  name: string;
  nickname: string | null;
  email: string | null;
};

type PlayerNick = {
  network: string;
  nick: string;
};

export type PlayerNickFormRow = PlayerNick;

type PlayerBase = WithIdAndStatus<PlayerStatus> &
  PlayerNameFields & {
    playerGroup: string | null;
  };

/* =========================================================
   🔹 CORE TYPES
========================================================= */

export interface ResolveNickProps {
  playerId: string;
  nickId: string;
  userId: string;
  role: UserRole;
}

/* =========================================================
   🔹 TABLE
========================================================= */

export type PlayersTableSortKey =
  | "name"
  | "email"
  | "nicks"
  | "playerGroup"
  | "coachLabel"
  | "gradeLabel"
  | "abiNumericValue"
  | "roiTenDay"
  | "fpTenDay"
  | "ftTenDay"
  | "status";

type PlayerMetrics = {
  abiKey: string;
  abiLabel: string;
  abiNumericValue: NullableNumber;
  abiUnit: string | null;
  roiTenDay: NullableNumber;
  fpTenDay: NullableNumber;
  ftTenDay: NullableNumber;
};

type PlayerRelations = {
  coachKey: string;
  coachLabel: string;
  gradeKey: string;
  gradeLabel: string;
};

export type PlayerTableRow = PlayerBase &
  PlayerRelations &
  PlayerMetrics & {
    sharkGroupNotFound?: boolean;
    nicks: PlayerNick[];
  };

export type PlayersTablePayload = {
  rows: PlayerTableRow[];
  coaches: CoachOpt[];
  grades: GradeOpt[];
  allowCoachSelect: boolean;
};

/* =========================================================
   🔹 INPUT / DATA LAYER
========================================================= */

export type PlayerRowInput = PlayerBase & {
  coachId: string | null;
  coach: { name: string } | null;
  gradeAssignments: Array<{ gradeProfile: EntityRef }>;
  nicks: PlayerNick[];
};

export type PlayerProfileRecord = Prisma.PlayerGetPayload<{
  include: typeof playerProfileInclude;
}>;

export type PlayerProfileViewModel = {
  player: PlayerProfileRecord;
  assignmentsByType: Record<
    GradeType,
    PlayerProfileRecord["gradeAssignments"][number] | undefined
  >;
  onTrackCount: number;
  attentionCount: number;
  offTrackCount: number;
  canManage: boolean;
};

export type PlayerProfileLoadResult =
  | { status: "not_found" }
  | { status: "forbidden" }
  | { status: "ok"; data: PlayerProfileViewModel };

/* =========================================================
   🔹 ENTITIES
========================================================= */

export interface Nick extends BaseEntity {
  nick: string;
  network: string;
  isActive: boolean;
}

/* =========================================================
   🔹 FILTERS
========================================================= */

export type PlayersTableFilterOptions = {
  name: Option[];
  nicks: Option[];
  playerGroup: Option[];
  coach: Option[];
  grade: Option[];
  abi: Option[];
  status: Option[];
};

/* =========================================================
   🔹 TABLE UI PROPS
========================================================= */

type PlayerActionHandler = (p: PlayerTableRow) => void;

export type PlayerTableRowActionsProps = {
  player: PlayerTableRow;
  canEditPlayers: boolean;
  onEdit: PlayerActionHandler;
};

export type PlayerDataRowProps = PlayerTableRowActionsProps;

/* =========================================================
   🔹 CELL PROPS (PADRONIZADO)
========================================================= */

export type PlayerGroupTableCellProps = {
  playerGroup: string | null;
  sharkGroupNotFound?: boolean;
};

export type PlayerNickItemProps = { nick: string; network: string };

export type PlayerNicksTableCellProps = { nicks: PlayerTableRow["nicks"] };

export type PlayerCoachTableCellProps = {
  coachKey: string;
  coachLabel: string;
};

export type PlayerGradeTableCellProps = {
  gradeKey: string;
  gradeLabel: string;
};

export type PlayerAbiTableCellProps = {
  abiKey: string;
  abiLabel: string;
};

export type PlayerRoiCellProps = { roi: NullableNumber };
export type PlayerFtTenDayCellProps = { value: NullableNumber };
export type PlayerFpTenDayCellProps = { value: NullableNumber };

export type PlayerStatusTableCellProps = {
  status: PlayerStatus;
};

/* =========================================================
   🔹 PROFILE UI
========================================================= */

export type PlayerProfileHeaderProps = {
  player: PlayerProfileRecord;
};

export type PlayerProfileSidebarProps = {
  player: PlayerProfileRecord;
};

/* =========================================================
   🔹 PAGE / CONTAINERS
========================================================= */

export type PlayersTableClientProps = {
  initialPayload: PlayersTablePayload;
  canEditPlayers: boolean;
};

export type PlayersListPageProps = {
  tablePayload: PlayersTablePayload;
  canEditPlayers: boolean;
  canCreatePlayer: boolean;
};

/* =========================================================
   🔹 MODALS
========================================================= */

export type EditPlayerModalProps = ModalProps & {
  player: PlayerTableRow | null;
  coaches: CoachOpt[];
  grades: GradeOpt[];
  allowCoachSelect: boolean;
};

export type NewPlayerModalProps = {
  coaches: CoachOpt[];
  grades: GradeOpt[];
};

/* =========================================================
   🔹 SECTIONS
========================================================= */

export interface PlayerNicksSectionProps {
  playerId: string;
  initialNicks: Nick[];
  canManage: boolean;
}

/* =========================================================
   🔹 DOMAIN MODEL
========================================================= */

export interface PlayerWithRelations
  extends WithIdAndStatus<PlayerStatus>,
    PlayerNameFields {
  avatarUrl: string | null;
  coach: EntityRef | null;
  dri: EntityRef | null;
  gradeAssignments: GradeAssignmentView[];
  _count: {
    targets: number;
    playedTournaments: number;
    reviewItems: number;
  };
}

/* ========================================================= */

export type {
  PlayersTableColumnKey,
  PlayersTableColumnFilters,
} from "../columnKeys";