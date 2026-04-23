"use client";

import { memo } from "react";
import ColumnFilter from "@/components/column-filter";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import type {
  IndicatorCatalogColKey,
  IndicatorCatalogColumnFilters,
  IndicatorCatalogColumnOptions,
  IndicatorsCatalogSetCol,
} from "@/lib/types/team/indicators-catalog-list";
import { cn } from "@/lib/utils/cn";

const WIDE_FILTER_COLS = new Set<IndicatorCatalogColKey>(["name", "definition", "glossary"]);

const IndicatorsCatalogTableColumnFilter = memo(function IndicatorsCatalogTableColumnFilter({
  columnId,
  col,
  label,
  options,
  filters,
  setCol,
}: {
  columnId: string;
  col: IndicatorCatalogColKey;
  label: string;
  options: IndicatorCatalogColumnOptions;
  filters: IndicatorCatalogColumnFilters;
  setCol: IndicatorsCatalogSetCol;
}) {
  return (
    <ColumnFilter
      columnId={columnId}
      ariaLabel={label}
      label={
        <FilteredColumnTitle active={filters[col] !== null}>{label}</FilteredColumnTitle>
      }
      options={options[col]}
      applied={filters[col]}
      onApply={setCol(col)}
      triggerClassName={cn(
        "text-base font-semibold leading-tight text-center",
        WIDE_FILTER_COLS.has(col) ? "max-w-[min(100%,18rem)]" : "max-w-[8.5rem]",
      )}
    />
  );
});

IndicatorsCatalogTableColumnFilter.displayName = "IndicatorsCatalogTableColumnFilter";

export default IndicatorsCatalogTableColumnFilter;
