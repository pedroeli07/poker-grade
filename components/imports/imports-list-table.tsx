"use client";

import { FileSpreadsheet, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import DataTableShell from "@/components/data-table/data-table-shell";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import { cn } from "@/lib/utils";
import {
  dataTableHeaderRowActiveRingClass,
  dataTableHeaderRowClass,
} from "@/lib/constants";
import { buildImportsFilterSummaryLines, formatImportsSortSummary } from "@/lib/utils/imports";
import ImportsTableRow from "@/components/imports/imports-table-row";
import {
  IMPORTS_COLUMN_IDS,
  IMPORTS_COLUMN_LABELS,
  IMPORTS_TABLE_COLUMN_ORDER,
} from "@/lib/constants";
import type {
  ColumnOptions,
  ImportListRow,
  ImportsColumnKey,
  ImportsFilters,
} from "@/lib/types";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import { memo, useCallback, useMemo, useState } from "react";
import SortButton from "@/components/sort-button";
import {
  compareDate,
  compareNumber,
  compareString,
  nextSortState,
  type SortDir,
} from "@/lib/table-sort";

export type ImportsSetCol = (
  col: ImportsColumnKey,
) => (next: Set<string> | null) => void;

function importColKind(col: ImportsColumnKey): "number" | "string" | "date" {
  if (col === "date") return "date";
  if (col === "fileName" || col === "player") return "string";
  return "number";
}

const ImportsListTable = memo(function ImportsListTable({
  canDelete,
  imports,
  filtered,
  options,
  filters,
  setCol,
  clearFilters,
  anyFilter,
  allSelected,
  selected,
  isPending,
  onToggleAllVisible,
  onToggleRow,
  onDeleteOne,
}: {
  canDelete: boolean;
  imports: ImportListRow[];
  filtered: ImportListRow[];
  options: ColumnOptions<ImportsColumnKey>;
  filters: ImportsFilters;
  setCol: ImportsSetCol;
  clearFilters: () => void;
  anyFilter: boolean;
  allSelected: boolean;
  selected: Set<string>;
  isPending: boolean;
  onToggleAllVisible: (ids: string[], select: boolean) => void;
  onToggleRow: (ids: string[]) => void;
  onDeleteOne: (id: string) => void;
}) {
  const colCount = canDelete ? 9 : 7;
  const [sort, setSort] = useState<{ key: ImportsColumnKey; dir: SortDir } | null>(null);

  const toggleSort = useCallback((key: ImportsColumnKey, kind: ColumnSortKind) => {
    setSort((prev) => nextSortState(prev, key, kind === "date" ? "date" : kind));
  }, []);

  const clearTableView = useCallback(() => {
    clearFilters();
    setSort(null);
  }, [clearFilters]);

  const hasActiveView = anyFilter || sort !== null;
  const filterSummaryLines = useMemo(
    () => buildImportsFilterSummaryLines(filters, options),
    [filters, options]
  );
  const sortSummary = useMemo(() => formatImportsSortSummary(sort), [sort]);

  const sortedFiltered = useMemo(() => {
    if (!sort) return filtered;
    const { key, dir } = sort;
    const copy = [...filtered];
    copy.sort((a, b) => {
      switch (key) {
        case "fileName":
          return compareString(a.fileName, b.fileName, dir);
        case "player":
          return compareString(a.playerName ?? "", b.playerName ?? "", dir);
        case "totalRows":
          return compareNumber(a.totalRows, b.totalRows, dir);
        case "played":
          return compareNumber(a.matchedInGrade, b.matchedInGrade, dir);
        case "extraPlay":
          return compareNumber(a.outOfGrade, b.outOfGrade, dir);
        case "didntPlay":
          return compareNumber(a.suspect, b.suspect, dir);
        case "date":
          return compareDate(a.createdAt, b.createdAt, dir);
        default:
          return 0;
      }
    });
    return copy;
  }, [filtered, sort]);

  return (
    <div className="space-y-3">
      <DataTableToolbar
        filteredCount={filtered.length}
        totalCount={imports.length}
        entityLabels={["importação", "importações"]}
        hasActiveView={hasActiveView}
        anyFilter={anyFilter}
        sortSummary={sortSummary}
        filterSummaryLines={filterSummaryLines}
        onClear={clearTableView}
      />
      <DataTableShell hasActiveView={hasActiveView}>
        <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow
            className={cn(
              dataTableHeaderRowClass,
              hasActiveView && dataTableHeaderRowActiveRingClass
            )}
          >
            {canDelete && (
              <TableHead className="w-12 pl-4">
                <button
                  type="button"
                  onClick={() =>
                    onToggleAllVisible(
                      sortedFiltered.map((i) => i.id),
                      !allSelected
                    )
                  }
                  disabled={sortedFiltered.length === 0}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer",
                    allSelected
                      ? "bg-blue-500 border-blue-500"
                      : "border-blue-300 bg-white hover:border-blue-400",
                    sortedFiltered.length === 0 && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {allSelected && <Check className="h-3 w-3 text-white" />}
                </button>
              </TableHead>
            )}
            {IMPORTS_TABLE_COLUMN_ORDER.map((col, i) => (
              <TableHead
                key={col}
                className={cn(
                  "text-foreground font-semibold",
                  i >= 1 && i <= 5 ? "text-center" : i === 6 ? "text-right" : ""
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-0.5",
                    i >= 1 && i <= 5 && "justify-center",
                    i === 0 && "justify-center",
                    i === 6 && "justify-end"
                  )}
                >
                  <SortButton
                    columnKey={col}
                    sort={sort}
                    toggleSort={toggleSort}
                    kind={importColKind(col)}
                    label={IMPORTS_COLUMN_LABELS[col]}
                  />
                  <ColumnFilter
                    columnId={IMPORTS_COLUMN_IDS[col]}
                    ariaLabel={IMPORTS_COLUMN_LABELS[col]}
                    label={
                      <FilteredColumnTitle active={filters[col] !== null}>
                        {IMPORTS_COLUMN_LABELS[col]}
                      </FilteredColumnTitle>
                    }
                    options={options[col]}
                    applied={filters[col]}
                    onApply={setCol(col)}
                  />
                </div>
              </TableHead>
            ))}
            {canDelete && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {imports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colCount} className="text-center py-12 text-muted-foreground">
                <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma importação realizada ainda.</p>
              </TableCell>
            </TableRow>
          ) : sortedFiltered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colCount} className="text-center py-12 text-muted-foreground">
                Nenhuma importação com os filtros atuais.
              </TableCell>
            </TableRow>
          ) : (
            sortedFiltered.map((item) => (
              <ImportsTableRow
                key={item.id}
                item={item}
                canDelete={canDelete}
                isSelected={selected.has(item.id)}
                isPending={isPending}
                onToggle={() => onToggleRow([item.id])}
                onDeleteRequest={() => onDeleteOne(item.id)}
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

ImportsListTable.displayName = "ImportsListTable";

export default ImportsListTable;
