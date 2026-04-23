import type { ColumnOptions, FilterMap } from "@/lib/types/primitives";

export const GOVERNANCE_DRI_FILTER_COLS = ["area", "responsible", "rules"] as const;

export type GovernanceDriColKey = (typeof GOVERNANCE_DRI_FILTER_COLS)[number];
export type GovernanceDriColumnFilters = FilterMap<GovernanceDriColKey>;
export type GovernanceDriColumnOptions = ColumnOptions<GovernanceDriColKey>;
export type GovernanceDriSetCol = (col: GovernanceDriColKey) => (next: Set<string> | null) => void;

export type GovernanceDriSortKey = "area" | "responsible" | "rules";
