import type { ColumnSortState } from "@/lib/types/sortButton";

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