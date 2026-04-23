"use client";

import { memo } from "react";
import { TableHead } from "@/components/ui/table";
import SortButton from "@/components/sort-button";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import type { SortDir } from "@/lib/table-sort";
import { GOVERNANCE_DRI_TABLE_HEAD_COLUMNS } from "@/lib/constants/team/governance-dri-columns";
import type {
  GovernanceDriColumnFilters,
  GovernanceDriColumnOptions,
  GovernanceDriSortKey,
  GovernanceDriSetCol,
} from "@/lib/types/team/governance-dri-matrix";
import GovernanceDriTableColumnFilter from "@/components/team/governance/governance-dri-table-column-filter";

const GovernanceDriTableHeadFilters = memo(function GovernanceDriTableHeadFilters({
  options,
  filters,
  setCol,
  sort,
  onSort,
}: {
  options: GovernanceDriColumnOptions;
  filters: GovernanceDriColumnFilters;
  setCol: GovernanceDriSetCol;
  sort: { key: GovernanceDriSortKey; dir: SortDir } | null;
  onSort: (key: GovernanceDriSortKey, kind: ColumnSortKind) => void;
}) {
  return (
    <>
      {GOVERNANCE_DRI_TABLE_HEAD_COLUMNS.map((col) => {
        if (col.id === "dri-actions") {
          return (
            <TableHead
              key={col.id}
              className={`${col.width} ${col.headCellClassName ?? ""} align-middle px-2 py-3 text-base`}
            >
              <span className="sr-only">Ações</span>
            </TableHead>
          );
        }
        const hasSort = col.sortKey && col.sortKind;
        const hasF = col.filterCol !== null;
        return (
          <TableHead
            key={col.id}
            className={`${col.width} ${col.headCellClassName ?? ""} align-middle text-left px-2 py-3 text-base`}
          >
            <div className="flex min-h-10 w-full items-center justify-start gap-0.5">
              {hasSort && hasF ? (
                <div className="flex w-full min-w-0 items-center justify-start gap-0.5">
                  <SortButton
                    columnKey={col.sortKey!}
                    sort={sort}
                    toggleSort={onSort}
                    kind={col.sortKind!}
                    label={col.label}
                  />
                  <GovernanceDriTableColumnFilter
                    columnId={`${col.id}-f`}
                    col={col.filterCol!}
                    label={col.label}
                    options={options}
                    filters={filters}
                    setCol={setCol}
                  />
                </div>
              ) : hasSort && !hasF ? (
                <div className="flex w-full min-w-0 items-center justify-start gap-0.5">
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
                <div className="flex w-full min-w-0 items-center justify-start">
                  <GovernanceDriTableColumnFilter
                    columnId={`${col.id}-f`}
                    col={col.filterCol!}
                    label={col.label}
                    options={options}
                    filters={filters}
                    setCol={setCol}
                  />
                </div>
              ) : (
                <span className="text-base font-semibold leading-tight text-foreground">{col.label}</span>
              )}
            </div>
          </TableHead>
        );
      })}
    </>
  );
});

GovernanceDriTableHeadFilters.displayName = "GovernanceDriTableHeadFilters";

export default GovernanceDriTableHeadFilters;
