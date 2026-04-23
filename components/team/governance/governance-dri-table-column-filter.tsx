"use client";

import { memo } from "react";
import ColumnFilter from "@/components/column-filter";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import type {
  GovernanceDriColKey,
  GovernanceDriColumnFilters,
  GovernanceDriColumnOptions,
  GovernanceDriSetCol,
} from "@/lib/types/team/governance-dri-matrix";
import { cn } from "@/lib/utils/cn";

const GovernanceDriTableColumnFilter = memo(function GovernanceDriTableColumnFilter({
  columnId,
  col,
  label,
  options,
  filters,
  setCol,
}: {
  columnId: string;
  col: GovernanceDriColKey;
  label: string;
  options: GovernanceDriColumnOptions;
  filters: GovernanceDriColumnFilters;
  setCol: GovernanceDriSetCol;
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
        "text-base font-semibold leading-tight text-left",
        col === "rules" ? "max-w-[min(100%,18rem)]" : col === "area" ? "max-w-[8.5rem]" : "max-w-[12rem]",
      )}
    />
  );
});

GovernanceDriTableColumnFilter.displayName = "GovernanceDriTableColumnFilter";

export default GovernanceDriTableColumnFilter;
