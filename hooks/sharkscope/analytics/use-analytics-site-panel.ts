"use client";

import { useCallback, useMemo, useState } from "react";
import type { NetworkStat, SharkscopeAnalyticsPeriod, SiteAnalyticsPayload, SiteTableSortKey } from "@/lib/types";
import { useSiteAnalytics } from "@/lib/use-sharkscope-analytics";
import useAnalyticsColumnSort from "@/hooks/sharkscope/analytics/use-analytics-column-sort";
import { sortSiteNetworkRows } from "@/lib/utils/sharlscope/analytics/sharkscope-analytics-table-sort";
// Não usar useAnalyticsSortedRows aqui: `filtered` só existe depois de useSiteAnalytics,
// mas useAnalyticsColumnSort tem de correr antes (ordem de hooks estável).
import { siteChartFormattersForMetric } from "@/lib/utils/sharlscope/analytics/site-analytics-panel-format";
import {
  buildSiteChartRows,
  canSiteFilterPlayers,
  computeDisplaySiteStats,
  isSiteChartHeuristicMetric,
  siteAnalyticsChartTitle,
  siteAnalyticsPeriodLabel,
  siteAnalyticsSelectionSummary,
  siteAnalyticsTriggerLabel,
} from "@/lib/utils/sharlscope/analytics/site-analytics-site-panel";
import { SITE_CHART_Y_METRICS, type SiteChartYMetric } from "@/lib/site-analytics-chart";

export function useAnalyticsSitePanel(
  stats: NetworkStat[],
  siteAnalytics: SiteAnalyticsPayload,
  period: SharkscopeAnalyticsPeriod
) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [yMetric, setYMetric] = useState<SiteChartYMetric>("roi");
  const [playerPickerOpen, setPlayerPickerOpen] = useState(false);
  const { sort: tableSort, toggleSort: toggleTableSort } = useAnalyticsColumnSort<SiteTableSortKey>();

  const canFilterPlayers = useMemo(() => canSiteFilterPlayers(siteAnalytics), [siteAnalytics]);

  const displayStats = useMemo(
    () => computeDisplaySiteStats(stats, siteAnalytics, selectedPlayerIds),
    [stats, siteAnalytics, selectedPlayerIds]
  );

  const selectionUsesFallback =
    canFilterPlayers && selectedPlayerIds.length > 0 && displayStats === stats;

  const {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    filtered,
    networkOptions,
    uniqueRois,
    uniqueProfits,
    uniqueItms,
    uniqueEarly,
    uniqueLate,
    uniqueCounts,
  } = useSiteAnalytics(displayStats);

  const sortedForTable = useMemo(
    () => sortSiteNetworkRows(filtered, tableSort),
    [filtered, tableSort]
  );

  const metricMeta = useMemo(
    () => SITE_CHART_Y_METRICS.find((m) => m.id === yMetric)!,
    [yMetric]
  );

  const { tickFormatter, tooltipFormatter } = useMemo(
    () => siteChartFormattersForMetric(yMetric),
    [yMetric]
  );

  const chartRows = useMemo(
    () => buildSiteChartRows(sortedForTable, yMetric),
    [sortedForTable, yMetric]
  );

  const periodLabel = useMemo(() => siteAnalyticsPeriodLabel(period), [period]);

  const selectionSummary = useMemo(
    () =>
      siteAnalyticsSelectionSummary(
        canFilterPlayers,
        selectedPlayerIds,
        siteAnalytics.playersWithSiteData
      ),
    [canFilterPlayers, selectedPlayerIds, siteAnalytics.playersWithSiteData]
  );

  const chartTitle = useMemo(
    () => siteAnalyticsChartTitle(yMetric, periodLabel, selectionSummary),
    [yMetric, periodLabel, selectionSummary]
  );

  const togglePlayer = useCallback((id: string) => {
    setSelectedPlayerIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const clearPlayers = useCallback(() => {
    setSelectedPlayerIds([]);
    setPlayerPickerOpen(false);
  }, []);

  const triggerLabel = useMemo(
    () =>
      siteAnalyticsTriggerLabel(
        canFilterPlayers,
        selectedPlayerIds,
        siteAnalytics.playersWithSiteData
      ),
    [canFilterPlayers, selectedPlayerIds, siteAnalytics.playersWithSiteData]
  );

  const chartHeuristicNote = useMemo(() => isSiteChartHeuristicMetric(yMetric), [yMetric]);

  return {
    selectedPlayerIds,
    yMetric,
    setYMetric,
    playerPickerOpen,
    setPlayerPickerOpen,
    tableSort,
    toggleTableSort,
    canFilterPlayers,
    selectionUsesFallback,
    filters,
    numFilters,
    setNumFilter,
    setCol,
    networkOptions,
    uniqueRois,
    uniqueProfits,
    uniqueItms,
    uniqueEarly,
    uniqueLate,
    uniqueCounts,
    sortedForTable,
    metricMeta,
    tickFormatter,
    tooltipFormatter,
    chartRows,
    chartTitle,
    togglePlayer,
    clearPlayers,
    triggerLabel,
    chartHeuristicNote,
  };
}
