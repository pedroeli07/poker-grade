"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
import GradeCard from "@/components/grades/grade-card";
import GradeTableRow from "@/components/grades/grade-table-row";
import GradesEmptyState from "@/components/grades/grades-view-components";
import GradesListTableHeadFilters from "@/components/grades/grades-list-table-head-filters";
import DataTableShell from "@/components/data-table/data-table-shell";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import type { GradesColumnFilters, GradesColumnKey, GradesColumnOptions } from "@/lib/types/columnKeys";
import type { GradeListRow, GradesSetCol } from "@/lib/types/grade/index";
import { dataTableHeaderRowActiveRingClass, dataTableHeaderRowClass } from "@/lib/constants/classes";
import { buildGradesFilterSummaryLines, formatGradesTableSortSummary } from "@/lib/utils/grade";
import { memo, useCallback, useMemo, useState } from "react";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import {
  compareNumber,
  compareString,
  nextSortState,
  type SortDir,
} from "@/lib/table-sort";
import { cn } from "@/lib/utils/cn";
const GradesListBody = memo(function GradesListBody({
  view,
  manage,
  filtered,
  totalCount,
  options,
  filters,
  setCol,
  anyFilter,
  clearFilters,
}: {
  view: "cards" | "table";
  manage: boolean;
  filtered: GradeListRow[];
  totalCount: number;
  options: GradesColumnOptions;
  filters: GradesColumnFilters;
  setCol: GradesSetCol;
  anyFilter: boolean;
  clearFilters: () => void;
}) {
  const [sort, setSort] = useState<{ key: GradesColumnKey; dir: SortDir } | null>(null);

  const onSort = useCallback((key: GradesColumnKey, kind: ColumnSortKind) => {
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const clearTableView = useCallback(() => {
    clearFilters();
    setSort(null);
  }, [clearFilters]);

  const hasActiveView = anyFilter || sort !== null;
  const filterSummaryLines = useMemo(
    () => buildGradesFilterSummaryLines(filters, options),
    [filters, options]
  );
  const sortSummary = useMemo(() => formatGradesTableSortSummary(sort), [sort]);

  const sortedTableRows = useMemo(() => {
    if (!sort) return filtered;
    const { key, dir } = sort;
    const copy = [...filtered];
    copy.sort((a, b) => {
      switch (key) {
        case "name":
          return compareString(a.name, b.name, dir);
        case "description":
          return compareString(a.description ?? "", b.description ?? "", dir);
        case "rules":
          return compareNumber(a.rulesCount, b.rulesCount, dir);
        default:
          return 0;
      }
    });
    return copy;
  }, [filtered, sort]);

  if (view === "cards") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((grade) => (
          <GradeCard key={grade.id} grade={grade} manage={manage} />
        ))}
        {filtered.length === 0 && (
          <GradesEmptyState anyFilter={anyFilter} clearFilters={clearFilters} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DataTableToolbar
        filteredCount={filtered.length}
        totalCount={totalCount}
        entityLabels={["grade", "grades"]}
        hasActiveView={hasActiveView}
        anyFilter={anyFilter}
        sortSummary={sortSummary}
        filterSummaryLines={filterSummaryLines}
        onClear={clearTableView}
      />
      <DataTableShell hasActiveView={hasActiveView}>
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <Table className="min-w-[720px] w-full table-fixed">
            <TableHeader>
              <TableRow
                className={cn(
                  `border-b border-border ${cardClassName}`,
                  dataTableHeaderRowClass,
                  hasActiveView && dataTableHeaderRowActiveRingClass
                )}
              >
                <GradesListTableHeadFilters
                  options={options}
                  filters={filters}
                  setCol={setCol}
                  sort={sort}
                  onSort={onSort}
                />
                <TableHead className="text-center w-[30px] align-middle text-foreground font-semibold">
                
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTableRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    Nenhuma grade com a seleção atual.
                  </TableCell>
                </TableRow>
              ) : (
                sortedTableRows.map((grade) => (
                  <GradeTableRow key={grade.id} grade={grade} manage={manage} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DataTableShell>
    </div>
  );
});

GradesListBody.displayName = "GradesListBody";

export default GradesListBody;
