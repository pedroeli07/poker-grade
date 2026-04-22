import type { loadMinhaGradePageData } from "@/lib/data/grades";
import type { GradeType } from "@prisma/client";
import type { STAT_CARD_TONE_CLASSES } from "@/lib/constants/jogador";
import type {
  AccountPendingResult,
  FilterMap,
  PlayerTournamentSchedulingStats,
  TableSortState,
} from "@/lib/types/primitives";
import type { PlayerProfileViewModel } from "@/lib/types/player";

export type RecentTourneyDashboardRow = {
  id: string;
  date: Date;
  tournamentName: string;
  site: string;
  buyInCurrency: string | null;
  buyInValue: number;
  scheduling: string | null;
};

export type PlayerDashboardViewProps = {
  player: { name: string; nickname: string | null; coach?: { name: string } | null };
  assignmentsByType: PlayerProfileViewModel["assignmentsByType"];
  gradeOrder: GradeType[];
  tourneyStats: PlayerTournamentSchedulingStats;
  pendingExtraReviews: number;
  targetsCount: number;
  mainGradeName: string | null;
  unreadNotifications: number;
  recentTourneys: RecentTourneyDashboardRow[];
};

export type MinhaGradePageData = NonNullable<Awaited<ReturnType<typeof loadMinhaGradePageData>>>;

export type JogadorDashboardPageReady = {
  kind: "ok";
  data: MinhaGradePageData;
  recentTourneys: RecentTourneyDashboardRow[];
  unreadNotifications: number;
};

export type JogadorDashboardPageResult = AccountPendingResult | JogadorDashboardPageReady;

export type PlayerTourneysSort = TableSortState<string>;

type PlayerTourneysSetFilterKey =
  | "schedulingFilter"
  | "siteFilter"
  | "speedFilter"
  | "priorityFilter"
  | "rebuyFilter"
  | "dateFilter"
  | "buyInFilter"
  | "tourneyFilter"
  | "sharkIdFilter";

export type PlayerTourneysFilterState = { search: string } & FilterMap<PlayerTourneysSetFilterKey>;

export type StatCardTone = keyof typeof STAT_CARD_TONE_CLASSES;
