"use client";

import { memo } from "react";
import { TableHead } from "@/components/ui/table";
import SortButton from "@/components/sort-button";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import type { SortDir } from "@/lib/table-sort";
import { INDICATOR_CATALOG_TABLE_HEAD_COLUMNS } from "@/lib/constants/team/indicators-catalog-columns";
import type {
  IndicatorCatalogColumnFilters,
  IndicatorCatalogColumnOptions,
  IndicatorCatalogSortKey,
  IndicatorsCatalogSetCol,
} from "@/lib/types/team/indicators-catalog-list";
import IndicatorsCatalogTableColumnFilter from "@/components/team/indicators/indicators-catalog-table-column-filter";

const IndicatorsCatalogTableHeadFilters = memo(function IndicatorsCatalogTableHeadFilters({
  options,
  filters,
  setCol,
  sort,
  onSort,
}: {
  options: IndicatorCatalogColumnOptions;
  filters: IndicatorCatalogColumnFilters;
  setCol: IndicatorsCatalogSetCol;
  sort: { key: IndicatorCatalogSortKey; dir: SortDir } | null;
  onSort: (key: IndicatorCatalogSortKey, kind: ColumnSortKind) => void;
}) {
  return (
    <>
      {INDICATOR_CATALOG_TABLE_HEAD_COLUMNS.map((col) => {
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
                  <IndicatorsCatalogTableColumnFilter
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
                  <IndicatorsCatalogTableColumnFilter
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

IndicatorsCatalogTableHeadFilters.displayName = "IndicatorsCatalogTableHeadFilters";

export default IndicatorsCatalogTableHeadFilters;
