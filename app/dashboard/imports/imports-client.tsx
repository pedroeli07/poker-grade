"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Trash2, Check } from "lucide-react";
import { ColumnFilter } from "@/components/column-filter";
import { cn } from "@/lib/utils";
import type { ImportListRow } from "@/lib/types";
import { ImportsTableRow } from "@/components/imports/imports-table-row";
import { ImportsDeleteDialog } from "@/components/imports/imports-delete-dialog";
import {
  IMPORTS_COLUMN_IDS,
  IMPORTS_COLUMN_LABELS,
  IMPORTS_TABLE_COLUMN_ORDER,
} from "@/lib/constants";
import { useImportsListPage } from "@/hooks/imports/use-imports-list-page";

export function ImportsClient({
  imports: initialImports,
  canDelete,
}: {
  imports: ImportListRow[];
  canDelete: boolean;
}) {
  const {
    imports,
    filtered,
    options,
    filters,
    anyFilter,
    clearFilters,
    setCol,
    allSelected,
    selected,
    setSelected,
    idsToDelete,
    setIdsToDelete,
    isPending,
    toggle,
    confirmDelete,
  } = useImportsListPage(initialImports);

  const colCount = canDelete ? 9 : 7;

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/15">
          <span className="text-sm font-semibold">
            {selected.size} selecionada{selected.size > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Limpar seleção
            </button>
            <button
              type="button"
              onClick={() => setIdsToDelete(Array.from(selected))}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/30 text-destructive border border-destructive/20 text-sm font-semibold hover:bg-destructive/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir ({selected.size})
            </button>
          </div>
        </div>
      )}

      {imports.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            Mostrando{" "}
            <span className="font-medium text-foreground">{filtered.length}</span> de{" "}
            <span className="font-medium text-foreground">{imports.length}</span> importaç
            {imports.length === 1 ? "ão" : "ões"}
          </span>
          {anyFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={clearFilters}
            >
              Limpar todos os filtros
            </Button>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-blue-100">
              {canDelete && (
                <TableHead className="w-12 pl-4">
                  <button
                    type="button"
                    onClick={() => toggle(filtered.map((i) => i.id), !allSelected)}
                    disabled={filtered.length === 0}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer",
                      allSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-blue-300 bg-white hover:border-blue-400",
                      filtered.length === 0 && "opacity-40 cursor-not-allowed"
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
                  <ColumnFilter
                    columnId={IMPORTS_COLUMN_IDS[col]}
                    label={IMPORTS_COLUMN_LABELS[col]}
                    options={options[col]}
                    applied={filters[col]}
                    onApply={setCol(col)}
                  />
                </TableHead>
              ))}
              {canDelete && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colCount}
                  className="text-center py-12 text-muted-foreground"
                >
                  <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhuma importação realizada ainda.</p>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colCount}
                  className="text-center py-12 text-muted-foreground"
                >
                  Nenhuma importação com os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <ImportsTableRow
                  key={item.id}
                  item={item}
                  canDelete={canDelete}
                  isSelected={selected.has(item.id)}
                  isPending={isPending}
                  onToggle={() => toggle([item.id])}
                  onDeleteRequest={() => setIdsToDelete([item.id])}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {imports.length > 0 && (
        <p className="text-xs text-muted-foreground px-1">
          {filtered.length} visível{filtered.length !== 1 ? "is" : ""}
          {anyFilter && ` (de ${imports.length} no total)`}
          {selected.size > 0 &&
            ` · ${selected.size} selecionada${selected.size > 1 ? "s" : ""}`}
        </p>
      )}

      <ImportsDeleteDialog
        isOpen={!!idsToDelete}
        idsToDelete={idsToDelete}
        isPending={isPending}
        onOpenChange={(open) => !open && setIdsToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
