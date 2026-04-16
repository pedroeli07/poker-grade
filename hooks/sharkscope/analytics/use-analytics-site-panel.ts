"use client";

import { useCallback, useMemo, useState } from "react";
import type { NetworkStat, SharkscopeAnalyticsPeriod, SiteAnalyticsPayload, SiteTableSortKey } from "@/lib/types";
import { useSiteAnalytics } from "@/lib/use-sharkscope-analytics";
import useAnalyticsColumnSort from "@/hooks/sharkscope/analytics/use-analytics-column-sort";
// Não usar useAnalyticsSortedRows aqui: `filtered` só existe depois de useSiteAnalytics,
// mas useAnalyticsColumnSort tem de correr antes (ordem de hooks estável).
import {
  buildSiteChartRows,
  canSiteFilterPlayers,
  computeDisplaySiteStats,
  isSiteChartHeuristicMetric,
  siteAnalyticsChartTitle,
  siteAnalyticsPeriodLabel,
  siteAnalyticsSelectionSummary,
  siteAnalyticsTriggerLabel,
  siteChartFormattersForMetric,
  sortSiteNetworkRows,
} from "@/lib/utils/sharkscope/analytics";
import { SITE_CHART_Y_METRICS, type SiteChartYMetric } from "@/lib/site-analytics-chart";

export type UseAnalyticsSitePanelOptions = {
  /** Ex.: debug com jogador na URL — pré-seleciona o multiselect “Jogadores”. */
  initialSelectedPlayerIds?: string[];
};

export function useAnalyticsSitePanel(
  stats: NetworkStat[],
  siteAnalytics: SiteAnalyticsPayload,
  period: SharkscopeAnalyticsPeriod,
  options?: UseAnalyticsSitePanelOptions
) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
    () => options?.initialSelectedPlayerIds ?? []
  );
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
    uniqueEntries,
    uniqueAbilities,
    uniqueAvStakes,
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

  /** Limpa a seleção de jogadores (volta ao “time inteiro”). Não fecha o popover — use ao limpar filtros dentro do menu. */
  const resetPlayerFilter = useCallback(() => {
    setSelectedPlayerIds([]);
  }, []);

  /** Junta estes ids à seleção (ex.: “marcar todos” na lista filtrada). */
  const addPlayerIdsToSelection = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setSelectedPlayerIds((prev) => Array.from(new Set([...prev, ...ids])));
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

  const tableSectionSubtitle = useMemo(
    () => `${periodLabel} — ${selectionSummary}`,
    [periodLabel, selectionSummary]
  );

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
    tableSectionSubtitle,
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
    uniqueEntries,
    uniqueAbilities,
    uniqueAvStakes,
    sortedForTable,
    metricMeta,
    tickFormatter,
    tooltipFormatter,
    chartRows,
    chartTitle,
    togglePlayer,
    resetPlayerFilter,
    addPlayerIdsToSelection,
    triggerLabel,
    chartHeuristicNote,
  };
}
