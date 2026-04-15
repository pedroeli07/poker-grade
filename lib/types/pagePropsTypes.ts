import type { UserRole } from "@prisma/client";
import type { CoachOpt, GradeOpt, PokerNetworkOption } from "./primitives";
import type { GradeDetailQueryData, GradeListRow } from "./gradeTypes";
import type { ImportListRow } from "./importTypes";
import type { PlayerTableRow } from "./playerTypes";
import type {
  ScoutingAnalysisRow,
  SharkscopeAlertRow,
  NetworkStat,
  RankingEntry,
  SiteAnalyticsPayload,
  TierStat,
  TypeStat,
} from "./sharkScopeTypes";
import type { TargetListRow, TargetsPagePlayerOption } from "./targetTypes";
import type { UsuarioDirectoryRow } from "./userTypes";

export type PlayersTablePayload = {
  rows: PlayerTableRow[];
  coaches: CoachOpt[];
  grades: GradeOpt[];
  allowCoachSelect: boolean;
};

export type PlayersListPageProps = {
  tablePayload: PlayersTablePayload;
  canEditPlayers: boolean;
  canCreatePlayer: boolean;
};

export type TargetsPageProps = {
  rows: TargetListRow[];
  players: TargetsPagePlayerOption[];
  canCreate: boolean;
  summary: { onTrack: number; attention: number; offTrack: number };
};

export type GradesListPageProps = {
  rows: GradeListRow[];
  manage: boolean;
};

export type GradeDetailClientProps = {
  gradeId: string;
  initialData: GradeDetailQueryData;
};

export type DashboardShellProps = {
  userRole: UserRole;
  displayName: string | null;
  email: string;
  /** Contagem vinda do servidor no layout — evita 1ª ida ao server action no mount do topbar. */
  initialUnreadCount: number;
};

export type UsuariosClientProps = {
  initialRows: UsuarioDirectoryRow[];
};

export type ScoutingClientProps = {
  networkOptions: PokerNetworkOption[];
  savedAnalyses: ScoutingAnalysisRow[];
};

export type AnalyticsClientProps = {
  stats30d: NetworkStat[];
  stats90d: NetworkStat[];
  siteAnalytics30d: SiteAnalyticsPayload;
  siteAnalytics90d: SiteAnalyticsPayload;
  ranking30d: RankingEntry[];
  ranking90d: RankingEntry[];
  tierStats30d: TierStat[];
  tierStats90d: TierStat[];
  typeStats30d: TypeStat[];
  hasData30d: boolean;
  hasData90d: boolean;
};

export type AlertsClientProps = {
  initialAlerts: SharkscopeAlertRow[];
  canAcknowledge: boolean;
};

export type ImportsListPageProps = {
  imports: ImportListRow[];
  canDelete: boolean;
  canImport: boolean;
};
