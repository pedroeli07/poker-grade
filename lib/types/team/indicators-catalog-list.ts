import type { ColumnOptions, FilterMap } from "@/lib/types/primitives";

export const INDICATOR_CATALOG_FILTER_COLS = [
  "name",
  "resultType",
  "definition",
  "dataSource",
  "responsibleName",
  "meta",
  "frequency",
  "autoAction",
  "glossary",
  "link",
] as const;

export type IndicatorCatalogColKey = (typeof INDICATOR_CATALOG_FILTER_COLS)[number];
export type IndicatorCatalogColumnFilters = FilterMap<IndicatorCatalogColKey>;
export type IndicatorCatalogColumnOptions = ColumnOptions<IndicatorCatalogColKey>;
export type IndicatorsCatalogSetCol = (col: IndicatorCatalogColKey) => (next: Set<string> | null) => void;

export type IndicatorCatalogSortKey =
  | "name"
  | "resultType"
  | "definition"
  | "dataSource"
  | "responsibleName"
  | "targetValue"
  | "frequency"
  | "autoAction"
  | "glossary";
