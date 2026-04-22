"use client";

import { memo } from "react";
import TargetsControlsCard from "@/components/targets/targets-controls-card";
import TargetsPageHeader from "@/components/targets/targets-page-header";
import TargetsSummaryCards from "@/components/targets/targets-summary-cards";
import { useTargetsListPage } from "@/hooks/targets/use-targets-list-page";
import type { TargetsPageProps } from "@/lib/types/target/index";
const TargetsPageClient = memo(function TargetsPageClient({
  rows: initialRows,
  players,
  canCreate,
  summary,
  isPlayer,
}: TargetsPageProps) {
  const {
    rows,
    view,
    setView,
    viewHydrated,
    filters,
    options,
    filtered,
    anyFilter,
    clearFilters,
    setCol,
    selected,
    setSelected,
    idsToDelete,
    setIdsToDelete,
    isPending,
    toggle,
    confirmDelete,
  } = useTargetsListPage(initialRows, { isPlayer });

  return (
    <div className="space-y-6">
      <TargetsPageHeader canCreate={canCreate} players={players} />
      <TargetsSummaryCards summary={summary} />
      {!viewHydrated ? (
        <div aria-busy />
      ) : (
      <TargetsControlsCard
        view={view}
        setView={setView}
        options={options}
        filters={filters}
        setCol={setCol}
        rows={rows}
        filtered={filtered}
        anyFilter={anyFilter}
        clearFilters={clearFilters}
        hidePlayerFilter={isPlayer}
        canWrite={canCreate}
        selected={selected}
        setSelected={setSelected}
        idsToDelete={idsToDelete}
        setIdsToDelete={setIdsToDelete}
        isBulkDeletePending={isPending}
        onToggleTargetSelection={toggle}
        onConfirmBulkDelete={confirmDelete}
      />
      )}
    </div>
  );
});

TargetsPageClient.displayName = "TargetsPageClient";

export default TargetsPageClient;
