"use client";

import { memo, useMemo } from "react";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import AlertsBulkDeleteDialog from "@/components/sharkscope/alerts/alerts-bulk-delete-dialog";
import AlertsFiltersRow from "@/components/sharkscope/alerts/alerts-filters-row";
import AlertsListSection from "@/components/sharkscope/alerts/alerts-list-section";
import AlertsPageHeader from "@/components/sharkscope/alerts/alerts-page-header";
import AlertsSelectionHint from "@/components/sharkscope/alerts/alerts-selection-hint";
import { useAlertsPageClient } from "@/hooks/sharkscope/alerts/use-alerts-page-client";
import type { SharkscopeAlertRow } from "@/lib/types";
import { alertsHasActiveView, buildAlertsFilterSummaryLines } from "@/lib/utils/sharkscope/alerts";

const AlertsClient = memo(function AlertsClient({
  initialAlerts,
  canAcknowledge,
}: {
  initialAlerts: SharkscopeAlertRow[];
  canAcknowledge: boolean;
}) {
  const {
    alerts,
    filterSeverity,
    setFilterSeverity,
    filterType,
    setFilterType,
    filterAck,
    setFilterAck,
    resetAlertFilters,
    filtered,
    unackedCount,
    isPending,
    acknowledge,
    acknowledgeAll,
    selectedIds,
    setSelectedIds,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    page,
    setPage,
    pageSize,
    setPageSize,
    paginatedRows,
    visibleSelectedIds,
    headerChecked,
    toggleSelectCurrentPage,
    confirmBulkDelete,
  } = useAlertsPageClient(initialAlerts);

  const alertsToolbarActive = useMemo(
    () =>
      alertsHasActiveView({
        severity: filterSeverity,
        alertType: filterType,
        ack: filterAck,
      }),
    [filterSeverity, filterType, filterAck]
  );

  const alertsFilterLines = useMemo(
    () =>
      buildAlertsFilterSummaryLines({
        severity: filterSeverity,
        alertType: filterType,
        ack: filterAck,
      }),
    [filterSeverity, filterType, filterAck]
  );

  return (
    <div className="space-y-6">
      <AlertsBulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        selectedCount={visibleSelectedIds.size}
        isPending={isPending}
        onConfirm={confirmBulkDelete}
      />

      <AlertsPageHeader
        canAcknowledge={canAcknowledge}
        unackedCount={unackedCount}
        isPending={isPending}
        onAcknowledgeAll={acknowledgeAll}
      />

      <AlertsFiltersRow
        filterSeverity={filterSeverity}
        onFilterSeverity={setFilterSeverity}
        filterType={filterType}
        onFilterType={setFilterType}
        filterAck={filterAck}
        onFilterAck={setFilterAck}
      />

      <DataTableToolbar
        filteredCount={filtered.length}
        totalCount={alerts.length}
        entityLabels={["alerta", "alertas"]}
        hasActiveView={alertsToolbarActive}
        anyFilter={alertsToolbarActive}
        sortSummary={null}
        filterSummaryLines={alertsFilterLines}
        onClear={resetAlertFilters}
      />

      {canAcknowledge && filtered.length > 0 && <AlertsSelectionHint />}

      <AlertsListSection
        canAcknowledge={canAcknowledge}
        filteredLength={filtered.length}
        visibleSelectedIds={visibleSelectedIds}
        isPending={isPending}
        setSelectedIds={setSelectedIds}
        setBulkDeleteOpen={setBulkDeleteOpen}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        paginatedRows={paginatedRows}
        selectedIds={selectedIds}
        headerChecked={headerChecked}
        toggleSelectCurrentPage={toggleSelectCurrentPage}
        acknowledge={acknowledge}
      />
    </div>
  );
});

AlertsClient.displayName = "AlertsClient";

export default AlertsClient;
