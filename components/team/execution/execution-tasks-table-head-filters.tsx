"use client";

import { memo } from "react";
import { TableHead } from "@/components/ui/table";
import SortButton from "@/components/sort-button";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import type { SortDir } from "@/lib/table-sort";
import { EXECUTION_TABLE_HEAD_COLUMNS } from "@/lib/constants/team/execution-list-columns";
import type {
  ExecutionTaskColumnFilters,
  ExecutionTaskColumnOptions,
  ExecutionTaskSortKey,
  ExecutionTasksSetCol,
} from "@/lib/types/team/execution-list";
import ExecutionTasksTableColumnFilter from "./execution-tasks-table-column-filter";

const ExecutionTasksTableHeadFilters = memo(function ExecutionTasksTableHeadFilters({
  options,
  filters,
  setCol,
  sort,
  onSort,
}: {
  options: ExecutionTaskColumnOptions;
  filters: ExecutionTaskColumnFilters;
  setCol: ExecutionTasksSetCol;
  sort: { key: ExecutionTaskSortKey; dir: SortDir } | null;
  onSort: (key: ExecutionTaskSortKey, kind: ColumnSortKind) => void;
}) {
  return (
    <>
      {EXECUTION_TABLE_HEAD_COLUMNS.map((col) => {
        const hasSort = col.sortKey && col.sortKind;
        const hasF = col.filterCol !== null;
        return (
          <TableHead
            key={col.id}
            className={`${col.width} align-middle text-center px-2 py-3 text-base`}
          >
            <div className="flex min-h-10 w-full items-center justify-center gap-0.5">
              {hasSort && hasF ? (
                <div className="flex w-full min-w-0 items-center justify-center gap-0.5">
                  <SortButton
                    columnKey={col.sortKey!}
                    sort={sort}
                    toggleSort={onSort}
                    kind={col.sortKind!}
                    label={col.label}
                  />
                  <ExecutionTasksTableColumnFilter
                    columnId={`${col.id}-f`}
                    col={col.filterCol!}
                    label={col.label}
                    options={options}
                    filters={filters}
                    setCol={setCol}
                  />
                </div>
              ) : hasSort && !hasF ? (
                <div className="flex w-full min-w-0 items-center justify-center gap-0.5">
                  <span className="shrink-0 text-base font-semibold leading-tight text-foreground">
                    {col.label}
                  </span>
                  <SortButton
                    columnKey={col.sortKey!}
                    sort={sort}
                    toggleSort={onSort}
                    kind={col.sortKind!}
                    label={col.label}
                  />
                </div>
              ) : !hasSort && hasF ? (
                <div className="flex w-full min-w-0 items-center justify-center">
                  <ExecutionTasksTableColumnFilter
                    columnId={`${col.id}-f`}
                    col={col.filterCol!}
                    label={col.label}
                    options={options}
                    filters={filters}
                    setCol={setCol}
                  />
                </div>
              ) : (
                <span className="text-base font-semibold leading-tight text-foreground">
                  {col.label}
                </span>
              )}
            </div>
          </TableHead>
        );
      })}
    </>
  );
});

ExecutionTasksTableHeadFilters.displayName = "ExecutionTasksTableHeadFilters";

export default ExecutionTasksTableHeadFilters;
