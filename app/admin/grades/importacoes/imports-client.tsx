"use client";

import { memo } from "react";
import type { ImportListRow } from "@/lib/types";
import ImportsDeleteDialog from "@/components/imports/imports-delete-dialog";
import { useImportsListPage } from "@/hooks/imports/use-imports-list-page";
import ImportsBulkSelectionBar from "@/components/imports/imports-bulk-selection-bar";
import ImportsListTable from "@/components/imports/imports-list-table";
import ImportsListFootnote from "@/components/imports/imports-list-footnote";

const ImportsClient = memo(function ImportsClient({
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

  return (
    <div className="space-y-3">
      <ImportsBulkSelectionBar
        selectedSize={selected.size}
        isPending={isPending}
        onClearSelection={() => setSelected(new Set())}
        onRequestBulkDelete={() => setIdsToDelete(Array.from(selected))}
      />

      <ImportsListTable
        canDelete={canDelete}
        imports={imports}
        filtered={filtered}
        options={options}
        filters={filters}
        setCol={setCol}
        clearFilters={clearFilters}
        anyFilter={anyFilter}
        allSelected={allSelected}
        selected={selected}
        isPending={isPending}
        onToggleAllVisible={(ids, select) => toggle(ids, select)}
        onToggleRow={(ids) => toggle(ids)}
        onDeleteOne={(id) => setIdsToDelete([id])}
      />

      <ImportsListFootnote
        importsLength={imports.length}
        filteredLength={filtered.length}
        anyFilter={anyFilter}
        selectedSize={selected.size}
      />

      <ImportsDeleteDialog
        isOpen={!!idsToDelete}
        idsToDelete={idsToDelete}
        isPending={isPending}
        onOpenChange={(open) => !open && setIdsToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
});

ImportsClient.displayName = "ImportsClient";

export default ImportsClient;
