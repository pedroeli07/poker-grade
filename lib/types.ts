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