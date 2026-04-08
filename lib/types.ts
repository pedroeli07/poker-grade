import type { PlayerStatus, UserRole } from "@prisma/client";
import { ReactNode } from "react";
import { getPendingReviewsForSession } from "./data/queries";
import { POKER_NETWORKS } from "./constants";

// ==========================================
// Core Domain Types
// ==========================================


export type {
  Player,
  Coach,
  GradeProfile,
  GradeRule,
  PlayerGradeAssignment,
  PlayerTarget,
  TournamentImport,
  PlayedTournament,
  GradeReviewItem,
  LimitChangeHistory,
  AuditLog,
} from "@prisma/client";

export type {
  UserRole,
  PlayerStatus,
  GradeType,
  ReviewStatus,
  TournamentMatchStatus,
  TargetStatus,
  TargetType,
  LimitAction,
} from "@prisma/client";

export type AppProvidersProps = {
  children: ReactNode;
};


// ==========================================
// Lobbyze Filter JSON Shape
// ==========================================

export interface LobbyzeFilterItem {
  item_id: number | string;
  item_text: string;
}

export interface LobbyzeFilter {
  id: number;
  name: string;
  site: LobbyzeFilterItem[];
  game2: LobbyzeFilterItem[];
  buy_in_min: number | null;
  buy_in_max: number | null;
  speed: LobbyzeFilterItem[];
  type: LobbyzeFilterItem[];
  players: LobbyzeFilterItem[];
  variant: LobbyzeFilterItem[];
  state: unknown;
  prize_pool_min: number | null;
  prize_pool_max: number | null;
  init_stacks_min: number | null;
  init_stacks_max: number | null;
  from_date: string | null;
  to_date: string | null;
  from_time: string | null;
  to_time: string | null;
  search: string;
  order: Record<string, number>;
  onlyNew: boolean;
  scheduled: unknown;
  maxLate: boolean;
  field: unknown;
  from_duration: unknown;
  priority: unknown;
  to_duration: unknown;
  limit: unknown;
  include_closed: boolean;
  timezone: number;
  exclude: string;
  flagged_only: unknown;
  auto_scheduled_only: unknown;
  show_exception: boolean;
  category: unknown;
  av_ability: unknown;
  currency: unknown;
  min_participants: number | null;
  week_day: LobbyzeFilterItem[] | null;
  auto_only: boolean;
  manual_only: boolean;
  deleted_filter_only: boolean;
  unchecked_filter_only: boolean;
  min_blind: number | null;
  max_blind: number | null;
  favorites: boolean;
}

export type GradeRuleCardRule = {
  id: string;
  filterName: string;
  lobbyzeFilterId: number | null;
  sites: LobbyzeFilterItem[];
  buyInMin: number | null;
  buyInMax: number | null;
  speed: LobbyzeFilterItem[];
  variant: LobbyzeFilterItem[];
  tournamentType: LobbyzeFilterItem[];
  gameType: LobbyzeFilterItem[];
  playerCount: LobbyzeFilterItem[];
  weekDay: LobbyzeFilterItem[];
  prizePoolMin: number | null;
  prizePoolMax: number | null;
  minParticipants: number | null;
  fromTime: string | null;
  toTime: string | null;
  excludePattern: string | null;
  timezone: number | null;
  autoOnly: boolean;
  manualOnly: boolean;
};

export type GradeDetailQueryData = {
  id: string;
  name: string;
  description: string | null;
  assignmentsCount: number;
  manageRules: boolean;
  canEditNote: boolean;
  rules: GradeRuleCardRule[];
};

export type ImportListRow = {
  id: string;
  fileName: string;
  playerName: string | null;
  totalRows: number;
  matchedInGrade: number;
  suspect: number;
  outOfGrade: number;
  createdAt: Date | string;
};

export type PlayerTableRow = {
  id: string;
  name: string;
  nickname: string | null;
  email: string | null;
  coachKey: string;
  coachLabel: string;
  gradeKey: string;
  gradeLabel: string;
  abiKey: string;
  abiLabel: string;
  abiNumericValue: number | null;
  abiUnit: string | null;
  status: PlayerStatus;
  playerGroup: string | null;
  roiTenDay: number | null;
  fpTenDay: number | null;
  ftTenDay: number | null;
  nicks: { network: string; nick: string }[];
};

export type TargetListRow = {
  id: string;
  name: string;
  category: string;
  playerId: string;
  playerName: string;
  status: "ON_TRACK" | "ATTENTION" | "OFF_TRACK";
  targetType: "NUMERIC" | "TEXT";
  limitAction: "UPGRADE" | "MAINTAIN" | "DOWNGRADE" | null;
  numericValue: number | null;
  numericCurrent: number | null;
  textValue: string | null;
  textCurrent: string | null;
  unit: string | null;
  coachNotes: string | null;
};

export type UsuarioDirectoryRow =
  | {
      kind: "pending";
      id: string;
      email: string;
      role: UserRole;
      createdAt: string;
      isRegistered: false;
    }
  | {
      kind: "account";
      id: string;
      email: string;
      role: UserRole;
      createdAt: string;
      isRegistered: true;
    };

export type UsuariosColumnKey = "email" | "role" | "status";
export type UsuariosColumnFilters = Record<UsuariosColumnKey, Set<string> | null>;

// ==========================================
// Excel Tournament Row Shape
// ==========================================

export interface ExcelTournamentRow {
  date: string;
  site: string;
  buyInCurrency: string;
  buyInValue: number;
  buyInUsd: number;
  tournamentName: string;
  scheduling: string;
  rebuy: boolean;
  speed: string;
  sharkId: string;
  priority: string;
}

// ==========================================
// View Types (API Responses)
// ==========================================

export interface PlayerWithRelations {
  id: string;
  name: string;
  nickname: string | null;
  email: string | null;
  status: string;
  avatarUrl: string | null;
  coach: { id: string; name: string } | null;
  dri: { id: string; name: string } | null;
  gradeAssignments: GradeAssignmentView[];
  _count: {
    targets: number;
    playedTournaments: number;
    reviewItems: number;
  };
}

export interface GradeAssignmentView {
  id: string;
  gradeType: string;
  isActive: boolean;
  gradeProfile: {
    id: string;
    name: string;
    _count: { rules: number };
  };
}

export interface GradeRuleView {
  id: string;
  filterName: string;
  sites: LobbyzeFilterItem[];
  buyInMin: number | null;
  buyInMax: number | null;
  speed: LobbyzeFilterItem[] | null;
  variant: LobbyzeFilterItem[] | null;
  prizePoolMin: number | null;
  minParticipants: number | null;
  excludePattern: string | null;
  weekDay: LobbyzeFilterItem[] | null;
  fromTime: string | null;
  toTime: string | null;
}

export interface ReviewItemView {
  id: string;
  status: string;
  player: { id: string; name: string; nickname: string | null };
  tournament: {
    id: string;
    date: string;
    site: string;
    buyInValue: number;
    tournamentName: string;
    speed: string | null;
    matchStatus: string;
  };
  justification: string | null;
  reviewNotes: string | null;
  isInfraction: boolean;
  createdAt: string;
}

// ==========================================
// Dashboard Stats
// ==========================================

export interface DashboardStats {
  totalPlayers: number;
  activePlayers: number;
  pendingReviews: number;
  totalTournaments: number;
  inGradePercentage: number;
  suspectCount: number;
  outOfGradeCount: number;
  recentInfractions: number;
}

// ==========================================
// Navigation
// ==========================================

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}


export interface TournamentData {
  site: string;
  buyInValue: number;
  buyInCurrency?: string;
  tournamentName: string;
  speed?: string;
  date?: Date;
}

export interface GradeRuleData {
  id: string;
  filterName: string;
  sites: LobbyzeFilterItem[];
  buyInMin: number | null;
  buyInMax: number | null;
  speed: LobbyzeFilterItem[] | null;
  variant: LobbyzeFilterItem[] | null;
  tournamentType: LobbyzeFilterItem[] | null;
  prizePoolMin: number | null;
  prizePoolMax: number | null;
  minParticipants: number | null;
  excludePattern: string | null;
  fromTime: string | null;
  toTime: string | null;
  weekDay: LobbyzeFilterItem[] | null;
}

export type MatchResult = "IN_GRADE" | "SUSPECT" | "OUT_OF_GRADE";

export interface MatchDetail {
  result: MatchResult;
  matchedRuleId: string | null;
  matchedRuleName: string | null;
  reasons: string[];
}

export type Tab = "extra" | "rebuy" | "played" | "missed";

export type GradeListRow = {
  id: string;
  name: string;
  description: string | null;
  rulesCount: number;
  assignmentsCount: number;
  assignedPlayers: { id: string; name: string }[];
};


export type ColumnKey = "name" | "description" | "rules" | "players";
export type ColumnFilters = Record<ColumnKey, Set<string> | null>;

export type ColKey =
  | "name"
  | "category"
  | "player"
  | "status"
  | "targetType"
  | "limitAction";

export type Filters = Record<ColKey, Set<string> | null>;

export type PlayerRowInput = {
  id: string;
  name: string;
  nickname: string | null;
  email: string | null;
  coachId: string | null;
  status: PlayerStatus;
  playerGroup: string | null;
  coach: { name: string } | null;
  gradeAssignments: Array<{ gradeProfile: { id: string; name: string } }>;
  nicks: { network: string; nick: string }[];
};

export type RoleVisual = { label: string; text: string; bg: string; icon: React.ReactNode };

// ==========================================
// SharkScope — dashboard (serialização / UI)
// ==========================================

export type SharkscopeAnalyticsPeriod = "30d" | "90d";

export type SharkscopeAnalyticsTab = "site" | "ranking" | "tier" | "bounty";

export type SharkscopeAlertRow = {
  id: string;
  playerId: string;
  alertType: string;
  severity: string;
  metricValue: number;
  threshold: number;
  context: unknown;
  triggeredAt: string;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  player: { id: string; name: string; nickname: string | null };
};

export type ScoutingAnalysisRow = {
  id: string;
  nick: string;
  network: string;
  rawData: unknown;
  nlqAnswer: unknown;
  notes: string | null;
  createdAt: string;
  savedBy: string;
};

export type PokerNetworkOption = { value: string; label: string };


export type ImportsColumnKey =
  | "fileName"
  | "player"
  | "totalRows"
  | "played"
  | "extraPlay"
  | "didntPlay"
  | "date";

export type ImportsFilters = Record<ImportsColumnKey, Set<string> | null>;

export type PlayersTableColumnKey = "name" | "nickname" | "playerGroup" | "coach" | "grade" | "abi" | "status";

export type PlayersTableColumnFilters = Record<PlayersTableColumnKey, Set<string> | null>;

export interface ProfileData {
  email: string;
  displayName: string | null;
  role: string;
  createdAt: string;
}

export type ReviewPlayerOption = {
  id: string;
  name: string;
  extraPlayCount: number;
};

export type ReviewCoachOption = {
  id: string;
  name: string;
  playerCount: number;
};



export type ReviewPathFilters = {
  playerId: string | null;
  coachId: string | null;
  page: number;
};

export type ReviewItem = Awaited<ReturnType<typeof getPendingReviewsForSession>>[number];


export type PlayersTablePayload = {
  rows: PlayerTableRow[];
  coaches: { id: string; name: string; role: string }[];
  grades: { id: string; name: string }[];
  allowCoachSelect: boolean;
};

export type NetworkStat = {
  network: string;
  label: string;
  roi: number | null;
  profit: number | null;
  count: number | null;
};

export type TierStat = {
  tier: "Low" | "Mid" | "High";
  roi: number | null;
  profit: number | null;
  count: number | null;
  players: number;
};

export type TypeStat = {
  type: "Bounty" | "Vanilla";
  roi: number | null;
  profit: number | null;
  count: number | null;
};

export type RankingEntry = {
  player: { id: string; name: string; nickname: string | null };
  roi: number;
  count: number;
};

export type PokerNetworkKey = keyof typeof POKER_NETWORKS;




export type SharkScopeResponse<T = unknown> = {
  Response: {
    "@success": "true" | "false";
    "@error"?: string;
    RemainingSearches?: number;
    PlayerResponse?: T;
    [key: string]: unknown;
  };
};



export type CoachOpt = { id: string; name: string; role: string };
export type GradeOpt = { id: string; name: string };


export type EditPlayerModalProps = {
  player: PlayerTableRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coaches: CoachOpt[];
  grades: GradeOpt[];
  allowCoachSelect: boolean;
};

export interface Nick {
  id: string;
  nick: string;
  network: string;
  isActive: boolean;
  createdAt: string | Date;
};

export interface PlayerNicksSectionProps {
  playerId: string;
  initialNicks: Nick[];
  canManage: boolean;
}

export type UserLimiter = (userId: string) => Promise<{
  ok: boolean;
  retryAfterSec: number;
}>;

export type SharkscopeScoutingSavedCardProps = {
  analysis: ScoutingAnalysisRow;
  expanded: boolean;
  isPending: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export type UsuariosInviteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type PlayerDataRowProps = {
  player: PlayerTableRow;
  canEditPlayers: boolean;
  onEdit: (p: PlayerTableRow) => void;
};

export type ImportBatchNotifyPayload = {
  fileName: string;
  sheetsProcessed: number;
  totalExtraPlays: number;
  summaryLines: string[];
};