"use client";

import { memo } from "react";
import { TableHead } from "@/components/ui/table";
import SortButton from "@/components/sort-button";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import type { SortDir } from "@/lib/table-sort";
import { GOVERNANCE_TABLE_HEAD_COLUMNS } from "@/lib/constants/team/governance-historical-columns";
import type {
  GovernanceDecisionColumnFilters,
  GovernanceDecisionColumnOptions,
  GovernanceDecisionSortKey,
  GovernanceDecisionsSetCol,
} from "@/lib/types/team/governance-historical";
import GovernanceHistoricalTableColumnFilter from "@/components/team/governance/governance-historical-table-column-filter";

const GovernanceHistoricalTableHeadFilters = memo(function GovernanceHistoricalTableHeadFilters({
  options,
  filters,
  setCol,
  sort,
  onSort,
}: {
  options: GovernanceDecisionColumnOptions;
  filters: GovernanceDecisionColumnFilters;
  setCol: GovernanceDecisionsSetCol;
  sort: { key: GovernanceDecisionSortKey; dir: SortDir } | null;
  onSort: (key: GovernanceDecisionSortKey, kind: ColumnSortKind) => void;
}) {
  return (
    <>
      {GOVERNANCE_TABLE_HEAD_COLUMNS.map((col) => {
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
                  <GovernanceHistoricalTableColumnFilter
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
                /* Rótulo só no ColumnFilter (evita "Tags Tags") */
                <div className="flex w-full min-w-0 items-center justify-center">
                  <GovernanceHistoricalTableColumnFilter
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

GovernanceHistoricalTableHeadFilters.displayName = "GovernanceHistoricalTableHeadFilters";

export default GovernanceHistoricalTableHeadFilters;
