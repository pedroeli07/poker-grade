"use client";

import { memo } from "react";
import { buildImportDetailTabs } from "@/lib/imports/import-detail-tabs";
import type { ImportDetailPageData } from "@/lib/types";
import ImportDetailHeader from "@/components/imports/import-detail-header";
import ImportDetailMetricCards from "@/components/imports/import-detail-metric-cards";
import ImportDetailTabNav from "@/components/imports/import-detail-tab-nav";
import ImportDetailTournamentsSection from "@/components/imports/import-detail-tournaments-section";

const ImportsIdClient = memo(function ImportsIdClient({
  importId,
  importRecord,
  activeTab,
  showActions,
  canDelete,
  extraPlay,
  withRebuy,
  played,
  missed,
  activeTournaments,
}: ImportDetailPageData) {
  const tabs = buildImportDetailTabs({
    extra: extraPlay.length,
    rebuy: withRebuy.length,
    played: played.length,
    missed: missed.length,
  });

  return (
    <div className="space-y-6">
      <ImportDetailHeader
        importId={importId}
        importRecord={importRecord}
        canDelete={canDelete}
        totalTournaments={importRecord.tournaments.length}
      />
      <ImportDetailMetricCards importId={importId} tabs={tabs} activeTab={activeTab} />
      <ImportDetailTabNav importId={importId} tabs={tabs} activeTab={activeTab} />
      <ImportDetailTournamentsSection
        activeTab={activeTab}
        showActions={showActions}
        activeTournaments={activeTournaments}
      />
    </div>
  );
});

ImportsIdClient.displayName = "ImportsIdClient";

export default ImportsIdClient;
