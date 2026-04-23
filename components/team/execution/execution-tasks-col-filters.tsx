"use client";

import { memo } from "react";
import ColumnFilter from "@/components/column-filter";
import { EXECUTION_CARD_FILTER_COLUMNS } from "@/lib/constants/team/execution-list-columns";
import type {
  ExecutionTaskColumnFilters,
  ExecutionTaskColumnOptions,
  ExecutionTasksSetCol,
} from "@/lib/types/team/execution-list";

const ExecutionTasksColFilters = memo(function ExecutionTasksColFilters({
  compact,
  options,
  filters,
  setCol,
}: {
  compact?: boolean;
  options: ExecutionTaskColumnOptions;
  filters: ExecutionTaskColumnFilters;
  setCol: ExecutionTasksSetCol;
}) {
  return (
    <>
      {EXECUTION_CARD_FILTER_COLUMNS.map(([id, col, label]) => (
        <ColumnFilter
          key={id}
          columnId={id}
          label={label}
          options={options[col]}
          applied={filters[col]}
          onApply={setCol(col)}
          compact={compact}
        />
      ))}
    </>
  );
});

ExecutionTasksColFilters.displayName = "ExecutionTasksColFilters";

export default ExecutionTasksColFilters;
