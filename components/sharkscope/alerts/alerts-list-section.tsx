"use client";

import { memo, useCallback } from "react";
import { DataTablePagination } from "@/components/data-table-pagination";
import AlertsBulkActionsBar from "@/components/sharkscope/alerts/alerts-bulk-actions-bar";
import AlertsEmptyState from "@/components/sharkscope/alerts/alerts-empty-state";
import AlertsTable from "@/components/sharkscope/alerts/alerts-table";
import { SHARKSCOPE_ALERTS_PAGE_SIZE_OPTIONS } from "@/lib/constants/sharkscope/alerts";
import type { SharkscopeAlertRow } from "@/lib/types";

const AlertsListSection = memo(function AlertsListSection({
  canAcknowledge,
  filteredLength,
  visibleSelectedIds,
  isPending,
  setSelectedIds,
  setBulkDeleteOpen,
  page,
  setPage,
  pageSize,
  setPageSize,
  paginatedRows,
  selectedIds,
  headerChecked,
  toggleSelectCurrentPage,
  acknowledge,
}: {
  canAcknowledge: boolean;
  filteredLength: number;
  visibleSelectedIds: Set<string>;
  isPending: boolean;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setBulkDeleteOpen: (open: boolean) => void;
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (n: number) => void;
  paginatedRows: SharkscopeAlertRow[];
  selectedIds: Set<string>;
  headerChecked: boolean | "indeterminate";
  toggleSelectCurrentPage: (checked: boolean) => void;
  acknowledge: (id: string) => void;
}) {
  const onToggleRowSelect = useCallback(
    (id: string, selected: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (selected) next.add(id);
        else next.delete(id);
        return next;
      });
    },
    [setSelectedIds]
  );

  if (filteredLength === 0) {
    return <AlertsEmptyState />;
  }

  return (
    <div className="space-y-3">
      {canAcknowledge && visibleSelectedIds.size > 0 && (
        <AlertsBulkActionsBar
          selectedCount={visibleSelectedIds.size}
          isPending={isPending}
          onClearSelection={() => setSelectedIds(new Set())}
          onRequestDelete={() => setBulkDeleteOpen(true)}
        />
      )}
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        totalItems={filteredLength}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[...SHARKSCOPE_ALERTS_PAGE_SIZE_OPTIONS]}
      />
      <AlertsTable
        canAcknowledge={canAcknowledge}
        paginatedRows={paginatedRows}
        selectedIds={selectedIds}
        onToggleRowSelect={onToggleRowSelect}
        headerChecked={headerChecked}
        onToggleSelectCurrentPage={toggleSelectCurrentPage}
        isPending={isPending}
        onAcknowledge={acknowledge}
      />
    </div>
  );
});

AlertsListSection.displayName = "AlertsListSection";

export default AlertsListSection;
