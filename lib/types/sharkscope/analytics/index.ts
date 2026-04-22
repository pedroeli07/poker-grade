import type { ColumnSortState } from "@/lib/types/dataTable";
import type { SiteChartYMetric } from "@/lib/site-analytics-chart";
import type { FilterMap, PlayerRef } from "../../primitives";
import type { NetworkStat, TierStat, TypeStat } from "../../sharkScopeTypes";

/** Ordem de métricas alinhada ao ranking: ROI → inscrições (`entries`) → … */
type CommonSortKey =
  | "roi"
  | "entries"
  | "profit"
  | "itm"
  | "ability"
  | "avStake"
  | "earlyFinish"
  | "lateFinish";

export type BountySortKey = CommonSortKey | "type";
export type RankingSortKey = CommonSortKey | "player";
export type TierSortKey = CommonSortKey | "tier";
export type SiteTableSortKey = CommonSortKey | "network";

/** Alias para ordenação das tabelas SharkScope analytics (mesmo modelo que `ColumnSortState`). */
export type AnalyticsSortState<K extends string> = ColumnSortState<K>;

export type AnalyticsRoiBarChartDatum = {
  key: string;
  name: string;
  fullName: string;
  roi: number;
};

export type AnalyticsMetricBarRow = {
  key: string;
  shortLabel: string;
  fullLabel: string;
  value: number;
};

export type MetricBarYAxisDomain = { domainMin: number; domainMax: number };

export type RoiBarYAxisDomain = { minR: number; maxR: number; pad: number };

export type AnalyticsMetricBarChartProps = {
  title: string;
  rows: AnalyticsMetricBarRow[];
  yAxisLabel: string;
  metric: SiteChartYMetric;
  tickFormatter: (v: number) => string;
  tooltipFormatter: (v: number) => string;
  /** Se false, o título não é renderizado (ex.: título no card pai). */
  showTitle?: boolean;
  /** Ex.: mt-0 quando o gráfico fica ao lado da tabela */
  className?: string;
};

export type SharkscopeAnalyticsPeriod = "30d" | "90d";
export type SharkscopeAnalyticsTab = "site" | "ranking" | "tier" | "bounty";

/** Referência mínima de jogador no multiselect “Por site” (nome para resumo do gráfico). */
export type SiteAnalyticsPlayerRef = { id: string; name: string };

type RankingEntryMetrics = {
  entries: number | null;
  profit: number | null;
  itm: number | null;
  /** Capacidade — stat API `Ability` (UI “Capacidade”), típico 0–100 */
  ability: number | null;
  avStake: number | null;
  earlyFinish: number | null;
  lateFinish: number | null;
};

export type RankingEntry = {
  player: PlayerRef;
  /** TotalROI (SharkScope) */
  roi: number;
  /** Inscrições (Entries); não usar Count de outro slice de filtro */
} & RankingEntryMetrics;

/** Dados extra para aba Por site: breakdown por jogador (cache v2). */
export type SiteAnalyticsPayload = {
  playersWithSiteData: SiteAnalyticsPlayerRef[];
  byPlayerId: Record<string, NetworkStat[]>;
  hasPerPlayerBreakdown: boolean;
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
  typeStats90d: TypeStat[];
  hasData30d: boolean;
  hasData90d: boolean;
};

export type AnalyticsDebugPageData = {
  players: { id: string; name: string; playerGroup: string }[];
  selectedPlayerId: string | null;
  playerMeta: { name: string; playerGroup: string } | null;
  analyticsProps: AnalyticsClientProps | null;
  listError: string | null;
};

export type AnalyticsSiteFilters = FilterMap<"network">;
export type AnalyticsSiteColumnKey = "network";
export type AnalyticsRankingFilters = FilterMap<"player">;
export type AnalyticsRankingColumnKey = "player";
export type AnalyticsTierFilters = FilterMap<"tier">;
export type AnalyticsTierColumnKey = "tier";
export type AnalyticsBountyFilters = FilterMap<"type">;
export type AnalyticsBountyColumnKey = "type";

/** Linha de entrada do gráfico de barras ROI (antes de `mapRoiBarChartData`). */
export type AnalyticsRoiBarRow = {
  key: string;
  shortLabel: string;
  fullLabel: string;
  roi: number | null;
};

export type AnalyticsRoiBarChartProps = {
  title: string;
  rows: AnalyticsRoiBarRow[];
  yAxisLabel?: string;
};
