"use client";

import { memo } from "react";
import ColumnFilter from "@/components/column-filter";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import type {
  ExecutionTaskColKey,
  ExecutionTaskColumnFilters,
  ExecutionTaskColumnOptions,
  ExecutionTasksSetCol,
} from "@/lib/types/team/execution-list";
import { cn } from "@/lib/utils/cn";

const ExecutionTasksTableColumnFilter = memo(function ExecutionTasksTableColumnFilter({
  columnId,
  col,
  label,
  options,
  filters,
  setCol,
}: {
  columnId: string;
  col: ExecutionTaskColKey;
  label: string;
  options: ExecutionTaskColumnOptions;
  filters: ExecutionTaskColumnFilters;
  setCol: ExecutionTasksSetCol;
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
        col === "title" ? "max-w-[min(100%,18rem)]" : "max-w-[8.5rem]",
      )}
    />
  );
});

ExecutionTasksTableColumnFilter.displayName = "ExecutionTasksTableColumnFilter";

export default ExecutionTasksTableColumnFilter;
