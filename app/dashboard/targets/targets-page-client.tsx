"use client";

import { memo } from "react";
import TargetsControlsCard from "@/components/targets/targets-controls-card";
import TargetsPageHeader from "@/components/targets/targets-page-header";
import TargetsSummaryCards from "@/components/targets/targets-summary-cards";
import { useTargetsListPage } from "@/hooks/targets/use-targets-list-page";
import type { TargetsPageProps } from "@/lib/types";

const TargetsPageClient = memo(function TargetsPageClient({
  rows: initialRows,
  players,
  canCreate,
  summary,
}: TargetsPageProps) {
  const { rows, view, setView, filters, options, filtered, anyFilter, clearFilters, setCol } =
    useTargetsListPage(initialRows);

  return (
    <div className="space-y-6">
      <TargetsPageHeader canCreate={canCreate} players={players} />
      <TargetsSummaryCards summary={summary} />
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
      />
    </div>
  );
});

TargetsPageClient.displayName = "TargetsPageClient";

export default TargetsPageClient;
