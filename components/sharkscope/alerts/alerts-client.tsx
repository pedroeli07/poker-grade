"use client";

import { memo, useMemo } from "react";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import AlertsBulkDeleteDialog from "@/components/sharkscope/alerts/alerts-bulk-delete-dialog";
import AlertsListSection from "@/components/sharkscope/alerts/alerts-list-section";
import AlertsPageHeader from "@/components/sharkscope/alerts/alerts-page-header";
import AlertsSelectionHint from "@/components/sharkscope/alerts/alerts-selection-hint";
import { useAlertsPageClient } from "@/hooks/sharkscope/alerts/use-alerts-page-client";
import type { SharkscopeAlertRow } from "@/lib/types";
import { alertsHasActiveView, buildAlertsFilterSummaryLines } from "@/lib/utils/sharkscope/alerts";

const SORT_KEY_LABEL: Record<string, string> = {
  severity: "Severidade",
  player: "Jogador",
  alertType: "Tipo",
  triggeredAt: "Data",
};

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
    filterPlayer,
    setFilterPlayer,
    filterData,
    setFilterData,
    filterValor,
    setFilterValor,
    filterLimite,
    setFilterLimite,
    resetAlertFilters,
    sort,
    toggleSort,
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
        player: filterPlayer,
        data: filterData,
        valor: filterValor,
        limite: filterLimite,
      }) || sort !== null,
    [filterSeverity, filterType, filterAck, filterPlayer, filterData, filterValor, filterLimite, sort]
  );

  const alertsFilterLines = useMemo(
    () =>
      buildAlertsFilterSummaryLines({
        severity: filterSeverity,
        alertType: filterType,
        ack: filterAck,
        player: filterPlayer,
        data: filterData,
        valor: filterValor,
        limite: filterLimite,
      }),
    [filterSeverity, filterType, filterAck, filterPlayer, filterData, filterValor, filterLimite]
  );

  const playerOptions = useMemo(
    () => Array.from(new Set(alerts.map((a) => a.player.name))).map((p) => ({ value: p, label: p })),
    [alerts]
  );

  const dataOptions = useMemo(
    () => Array.from(new Set(alerts.map((a) => a.triggeredAt.split("T")[0]))).map((d) => {
      // simple formatting for the label (matches YYYY-MM-DD or similar ISO prefix)
      const dObj = new Date(d);
      return { value: d, label: isNaN(dObj.getTime()) ? d : dObj.toLocaleDateString("pt-BR") };
    }),
    [alerts]
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

      <DataTableToolbar
        filteredCount={filtered.length}
        totalCount={alerts.length}
        entityLabels={["alerta", "alertas"]}
        hasActiveView={alertsToolbarActive}
        anyFilter={alertsHasActiveView({
          severity: filterSeverity,
          alertType: filterType,
          ack: filterAck,
          player: filterPlayer,
          data: filterData,
          valor: filterValor,
          limite: filterLimite,
        })}
        sortSummary={sort ? `${SORT_KEY_LABEL[sort.key] ?? sort.key} (${sort.dir === "asc" ? "A→Z" : "Z→A"})` : null}
        filterSummaryLines={alertsFilterLines}
        onClear={resetAlertFilters}
      />

      {canAcknowledge && filtered.length > 0 && <AlertsSelectionHint />}

      <AlertsListSection
        hasActiveView={alertsToolbarActive}
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

AlertsClient.displayName = "AlertsClient";

export default AlertsClient;
