import type { ColumnSortState } from "@/lib/types/sortButton";

export type BountySortKey = "type" | "roi" | "roiWeighted" | "profit" | "count";

export type RankingSortKey =
  | "player"
  | "roi"
  | "entries"
  | "profit"
  | "itm"
  | "ability"
  | "avStake"
  | "earlyFinish"
  | "lateFinish";

export type TierSortKey = "tier" | "roi" | "roiWeighted" | "profit" | "count" | "players";

export type SiteTableSortKey =
  | "network"
  | "roi"
  | "profit"
  | "itm"
  | "earlyFinish"
  | "lateFinish"
  | "count";

/** Alias para ordenação das tabelas SharkScope analytics (mesmo modelo que `ColumnSortState`). */
export type AnalyticsSortState<K extends string> = ColumnSortState<K>;
