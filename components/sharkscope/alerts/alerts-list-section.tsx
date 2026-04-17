"use client";

import { memo, useCallback } from "react";
import { DataTablePagination } from "@/components/data-table-pagination";
import AlertsBulkActionsBar from "@/components/sharkscope/alerts/alerts-bulk-actions-bar";
import AlertsEmptyState from "@/components/sharkscope/alerts/alerts-empty-state";
import AlertsTable from "@/components/sharkscope/alerts/alerts-table";
import { SHARKSCOPE_ALERTS_PAGE_SIZE_OPTIONS } from "@/lib/constants/sharkscope/alerts";
import type { SharkscopeAlertRow } from "@/lib/types";
import type { AlertSortKey } from "@/hooks/sharkscope/alerts/use-alerts-page-client";
import type { ColumnSortState } from "@/lib/types/dataTable";
import type { NumberFilterValue } from "@/lib/number-filter";

const AlertsListSection = memo(function AlertsListSection({
  hasActiveView,
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
  sort,
  toggleSort,
  filterSeverity,
  filterType,
  filterAck,
  filterPlayer,
  filterValor,
  filterLimite,
  filterData,
  setFilterSeverity,
  setFilterType,
  setFilterAck,
  setFilterPlayer,
  setFilterValor,
  setFilterLimite,
  setFilterData,
  playerOptions,
  dataOptions,
}: {
  hasActiveView: boolean;
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
  sort: ColumnSortState<AlertSortKey>;
  toggleSort: (key: AlertSortKey, kind: "string" | "date" | "number") => void;
  filterSeverity: Set<string> | null;
  filterType: Set<string> | null;
  filterAck: Set<string> | null;
  filterPlayer: Set<string> | null;
  filterValor: NumberFilterValue | null;
  filterLimite: NumberFilterValue | null;
  filterData: Set<string> | null;
  setFilterSeverity: (v: Set<string> | null) => void;
  setFilterType: (v: Set<string> | null) => void;
  setFilterAck: (v: Set<string> | null) => void;
  setFilterPlayer: (v: Set<string> | null) => void;
  setFilterValor: (v: NumberFilterValue | null) => void;
  setFilterLimite: (v: NumberFilterValue | null) => void;
  setFilterData: (v: Set<string> | null) => void;
  playerOptions: { value: string; label: string }[];
  dataOptions: { value: string; label: string }[];
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
        hasActiveView={hasActiveView}
        canAcknowledge={canAcknowledge}
        paginatedRows={paginatedRows}
        selectedIds={selectedIds}
        onToggleRowSelect={onToggleRowSelect}
        headerChecked={headerChecked}
        onToggleSelectCurrentPage={toggleSelectCurrentPage}
        isPending={isPending}
        onAcknowledge={acknowledge}
        sort={sort}
        toggleSort={toggleSort}
        filterSeverity={filterSeverity}
        filterType={filterType}
        filterAck={filterAck}
        filterPlayer={filterPlayer}
        filterValor={filterValor}
        filterLimite={filterLimite}
        filterData={filterData}
        setFilterSeverity={setFilterSeverity}
        setFilterType={setFilterType}
        setFilterAck={setFilterAck}
        setFilterPlayer={setFilterPlayer}
        setFilterValor={setFilterValor}
        setFilterLimite={setFilterLimite}
        setFilterData={setFilterData}
        playerOptions={playerOptions}
        dataOptions={dataOptions}
      />
    </div>
  );
});

AlertsListSection.displayName = "AlertsListSection";

export default AlertsListSection;
