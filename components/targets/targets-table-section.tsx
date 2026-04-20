"use client";

import { memo, useCallback, useMemo } from "react";
import ColumnFilter from "@/components/column-filter";
import DataTableShell from "@/components/data-table/data-table-shell";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TARGETS_TABLE_HEAD_COLUMNS,
  TARGETS_TABLE_STATIC_COLUMNS,
} from "@/lib/constants/target";
import {
  dataTableHeaderRowActiveRingClass,
  dataTableHeaderRowClass,
} from "@/lib/constants";
import { useTargetsTableSection } from "@/hooks/targets/use-targets-table-section";
import type { ColKey, Filters, TargetListRow, TargetsColumnOptions } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  buildTargetsFilterSummaryLines,
  formatTargetsSortSummary,
} from "@/lib/utils/target";
import TargetTableRow from "@/components/targets/target-table-row";
import SortButton from "@/components/sort-button";
import { Check } from "lucide-react";

/** Colunas de dados: 9 com Jogador, 8 sem (visão jogador). */
function targetsTableDataColSpan(hidePlayerColumn: boolean) {
  return hidePlayerColumn ? 8 : 9;
}
function targetsTableDataColSpanWithBulk(hidePlayerColumn: boolean) {
  return hidePlayerColumn ? 9 : 10;
}

const TargetsTableSection = memo(function TargetsTableSection({
  filtered,
  options,
  filters,
  setCol,
  totalCount,
  anyFilter,
  clearFilters,
  canWrite,
  selected,
  isBulkDeletePending,
  onToggleTargetSelection,
  hidePlayerFilter = false,
}: {
  filtered: TargetListRow[];
  options: TargetsColumnOptions;
  filters: Filters;
  setCol: (col: ColKey) => (next: Set<string> | null) => void;
  totalCount: number;
  anyFilter: boolean;
  clearFilters: () => void;
  hidePlayerFilter?: boolean;
  canWrite: boolean;
  selected: Set<string>;
  isBulkDeletePending: boolean;
  onToggleTargetSelection: (ids: string[], force?: boolean) => void;
}) {
  const { sort, toggleSort, resetSort, rows } = useTargetsTableSection(filtered);

  const allSelected =
    rows.length > 0 && rows.every(({ row }) => selected.has(row.id));

  const hasActiveView = anyFilter || sort !== null;
  const filterSummaryLines = useMemo(
    () =>
      buildTargetsFilterSummaryLines(filters, options, {
        omitPlayer: hidePlayerFilter,
      }),
    [filters, options, hidePlayerFilter]
  );
  const sortSummary = useMemo(() => formatTargetsSortSummary(sort), [sort]);

  const onClear = useCallback(() => {
    clearFilters();
    resetSort();
  }, [clearFilters, resetSort]);

  const tableHeadColumns = useMemo(
    () =>
      hidePlayerFilter
        ? TARGETS_TABLE_HEAD_COLUMNS.filter(([, , col]) => col !== "player")
        : TARGETS_TABLE_HEAD_COLUMNS,
    [hidePlayerFilter]
  );
  const emptyColSpan = targetsTableDataColSpanWithBulk(!!hidePlayerFilter);

  return (
    <div className="space-y-3">
      <DataTableToolbar
        filteredCount={filtered.length}
        totalCount={totalCount}
        entityLabels={["target", "targets"]}
        hasActiveView={hasActiveView}
        anyFilter={anyFilter}
        sortSummary={sortSummary}
        filterSummaryLines={filterSummaryLines}
        onClear={onClear}
      />
      <DataTableShell hasActiveView={hasActiveView}>
        <div className="relative w-full overflow-x-auto">
          <Table className="min-w-[1100px] w-full table-fixed">
            <TableHeader>
              <TableRow
                className={cn(
                  "border-b border-border transition-colors",
                  dataTableHeaderRowClass,
                  hasActiveView && dataTableHeaderRowActiveRingClass
                )}
              >
                {canWrite && (
                  <TableHead className="w-12 pl-4">
                    <button
                      type="button"
                      onClick={() =>
                        onToggleTargetSelection(
                          rows.map(({ row }) => row.id),
                          !allSelected
                        )
                      }
                      disabled={rows.length === 0 || isBulkDeletePending}
                      className={cn(
                        "flex h-5 w-5 cursor-pointer items-center justify-center rounded border transition-colors",
                        allSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-blue-300 bg-white hover:border-blue-400",
                        (rows.length === 0 || isBulkDeletePending) &&
                          "cursor-not-allowed opacity-40"
                      )}
                      aria-label={allSelected ? "Desmarcar todos" : "Selecionar todos visíveis"}
                    >
                      {allSelected && <Check className="h-3 w-3 text-white" />}
                    </button>
                  </TableHead>
                )}
                {tableHeadColumns.map(([w, id, col, label]) => (
                  <TableHead
                    key={id}
                    className={cn(`${w} h-14 align-middle text-center`)}
                  >
                    <div className="flex items-center justify-center gap-1 py-1">
                      <SortButton
                        columnKey={col}
                        sort={sort}
                        toggleSort={toggleSort}
                        kind="string"
                        label={label}
                      />
                      <ColumnFilter
                        columnId={id}
                        ariaLabel={label}
                        label={
                          <FilteredColumnTitle active={filters[col] !== null}>
                            {label}
                          </FilteredColumnTitle>
                        }
                        options={options[col] || []}
                        applied={filters[col]}
                        onApply={setCol(col)}
                      />
                    </div>
                  </TableHead>
                ))}
                {TARGETS_TABLE_STATIC_COLUMNS.map(([w, id, label]) => (
                  <TableHead
                    key={id}
                    className={cn(`${w} h-14 align-middle text-center`)}
                  >
                    <div className="flex items-center justify-center py-1 font-semibold text-foreground">
                      {label}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      canWrite
                        ? emptyColSpan
                        : targetsTableDataColSpan(!!hidePlayerFilter)
                    }
                    className="py-12 text-center text-muted-foreground"
                  >
                    Nenhum target com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(({ row, vm }) => (
                  <TargetTableRow
                    key={vm.id}
                    vm={vm}
                    row={row}
                    hidePlayerColumn={!!hidePlayerFilter}
                    canWrite={canWrite}
                    bulkSelect={
                      canWrite
                        ? {
                            isSelected: selected.has(row.id),
                            isPending: isBulkDeletePending,
                            onToggle: () => onToggleTargetSelection([row.id]),
                          }
                        : null
                    }
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DataTableShell>
    </div>
  );
});

TargetsTableSection.displayName = "TargetsTableSection";

export default TargetsTableSection;
