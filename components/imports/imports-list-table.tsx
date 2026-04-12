"use client";

import { FileSpreadsheet, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import { cn } from "@/lib/utils";
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
import { memo, useCallback, useMemo, useState } from "react";
import { TableColumnSortButton } from "@/components/table-column-sort-button";
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
  allSelected: boolean;
  selected: Set<string>;
  isPending: boolean;
  onToggleAllVisible: (ids: string[], select: boolean) => void;
  onToggleRow: (ids: string[]) => void;
  onDeleteOne: (id: string) => void;
}) {
  const colCount = canDelete ? 9 : 7;
  const [sort, setSort] = useState<{ key: ImportsColumnKey; dir: SortDir } | null>(null);

  const toggleSort = useCallback((key: ImportsColumnKey) => {
    const kind = importColKind(key);
    setSort((prev) => nextSortState(prev, key, kind === "date" ? "date" : kind));
  }, []);

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
          return compareNumber(a.suspect, b.suspect, dir);
        case "didntPlay":
          return compareNumber(a.outOfGrade, b.outOfGrade, dir);
        case "date":
          return compareDate(a.createdAt, b.createdAt, dir);
        default:
          return 0;
      }
    });
    return copy;
  }, [filtered, sort]);

  const sortBtn = (col: ImportsColumnKey, label: string) => {
    const active = sort?.key === col;
    return (
      <TableColumnSortButton
        ariaLabel={`Ordenar por ${label}`}
        isActive={active}
        direction={active ? sort!.dir : null}
        onClick={() => toggleSort(col)}
      />
    );
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-blue-100">
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
                  "text-blue-900 font-semibold",
                  i >= 2 && i <= 5 ? "text-center" : i === 6 ? "text-right" : ""
                )}
              >
                <div className={cn("flex items-center gap-0.5", i >= 2 && i <= 5 && "justify-center", i === 6 && "justify-end")}>
                  {sortBtn(col, IMPORTS_COLUMN_LABELS[col])}
                  <ColumnFilter
                    columnId={IMPORTS_COLUMN_IDS[col]}
                    label={IMPORTS_COLUMN_LABELS[col]}
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
  );
});

ImportsListTable.displayName = "ImportsListTable";

export default ImportsListTable;
