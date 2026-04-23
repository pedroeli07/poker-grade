"use client";

import { memo } from "react";
import { TableHead } from "@/components/ui/table";
import SortButton from "@/components/sort-button";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import type { SortDir } from "@/lib/table-sort";
import { RITUAL_TABLE_HEAD_COLUMNS } from "@/lib/constants/team/rituals-list-columns";
import type {
  RitualListColumnFilters,
  RitualListColumnOptions,
  RitualListSortKey,
  RitualListSetCol,
} from "@/lib/types/team/rituals-list";
import RitualsListTableColumnFilter from "@/components/team/rituals/rituals-list-table-column-filter";

const RitualsListTableHeadFilters = memo(function RitualsListTableHeadFilters({
  options,
  filters,
  setCol,
  sort,
  onSort,
}: {
  options: RitualListColumnOptions;
  filters: RitualListColumnFilters;
  setCol: RitualListSetCol;
  sort: { key: RitualListSortKey; dir: SortDir } | null;
  onSort: (key: RitualListSortKey, kind: ColumnSortKind) => void;
}) {
  return (
    <>
      {RITUAL_TABLE_HEAD_COLUMNS.map((col) => {
        const hasSort = col.sortKey && col.sortKind;
        const hasF = col.filterCol !== null;
        return (
          <TableHead key={col.id} className={`${col.width} px-1.5 py-2.5 text-center align-middle`}>
            <div className="flex min-h-9 w-full items-center justify-center gap-0.5">
              {hasSort && hasF ? (
                <div className="flex w-full min-w-0 items-center justify-center gap-0.5">
                  <SortButton
                    columnKey={col.sortKey!}
                    sort={sort}
                    toggleSort={onSort}
                    kind={col.sortKind!}
                    label={col.label}
                  />
                  <RitualsListTableColumnFilter
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
                  <span className="shrink-0 text-sm font-semibold leading-tight text-foreground">
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
                  <RitualsListTableColumnFilter
                    columnId={`${col.id}-f`}
                    col={col.filterCol!}
                    label={col.label}
                    options={options}
                    filters={filters}
                    setCol={setCol}
                  />
                </div>
              ) : (
                <span className="text-sm font-semibold leading-tight text-foreground">{col.label}</span>
              )}
            </div>
          </TableHead>
        );
      })}
    </>
  );
});

RitualsListTableHeadFilters.displayName = "RitualsListTableHeadFilters";

export default RitualsListTableHeadFilters;
