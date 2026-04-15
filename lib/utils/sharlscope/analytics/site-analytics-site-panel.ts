import type { AnalyticsMetricBarRow } from "@/lib/types/analyticsMetricBarChart";
import type { NetworkStat, SharkscopeAnalyticsPeriod, SiteAnalyticsPayload, TierStat } from "@/lib/types";
import {
  mergeNetworkStatsForSelection,
  SITE_CHART_Y_METRICS,
  siteChartYValue,
  type SiteChartYMetric,
} from "@/lib/site-analytics-chart";

export function canSiteFilterPlayers(siteAnalytics: SiteAnalyticsPayload): boolean {
  return siteAnalytics.hasPerPlayerBreakdown && siteAnalytics.playersWithSiteData.length > 0;
}

export function computeDisplaySiteStats(
  stats: NetworkStat[],
  siteAnalytics: SiteAnalyticsPayload,
  selectedPlayerIds: string[]
): NetworkStat[] {
  if (!canSiteFilterPlayers(siteAnalytics) || selectedPlayerIds.length === 0) {
    return stats;
  }
  const rowsList = selectedPlayerIds
    .map((id) => siteAnalytics.byPlayerId[id])
    .filter((r): r is NetworkStat[] => Array.isArray(r) && r.length > 0);
  if (rowsList.length === 0) {
    return stats;
  }
  /** Uma seleção: evita `mergeNetworkStatsForSelection` (exige stake CT; linhas por nick têm stake 0). */
  if (rowsList.length === 1) {
    return rowsList[0]!;
  }
  return mergeNetworkStatsForSelection(rowsList);
}

export function siteAnalyticsPeriodLabel(period: SharkscopeAnalyticsPeriod): string {
  return period === "30d" ? "últimos 30 dias" : "últimos 90 dias";
}

export function siteAnalyticsSelectionSummary(
  canFilterPlayers: boolean,
  selectedPlayerIds: string[],
  playersWithSiteData: { id: string; name: string }[]
): string {
  if (!canFilterPlayers || selectedPlayerIds.length === 0) {
    if (playersWithSiteData.length === 1) {
      return playersWithSiteData[0]!.name;
    }
    return "time inteiro";
  }
  const names = selectedPlayerIds
    .map((id) => playersWithSiteData.find((p) => p.id === id)?.name)
    .filter(Boolean) as string[];
  if (names.length === 0) return "seleção";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]!} e ${names[1]!}`;
  return `${names.length} jogadores`;
}

export function siteAnalyticsTriggerLabel(
  canFilterPlayers: boolean,
  selectedPlayerIds: string[],
  playersWithSiteData: { id: string; name: string }[]
): string {
  if (!canFilterPlayers) return "Time inteiro";
  if (selectedPlayerIds.length === 0) {
    if (playersWithSiteData.length === 1) {
      return playersWithSiteData[0]!.name;
    }
    return "Time inteiro";
  }
  if (selectedPlayerIds.length === 1) {
    return playersWithSiteData.find((p) => p.id === selectedPlayerIds[0])?.name ?? "1 jogador";
  }
  return `${selectedPlayerIds.length} jogadores`;
}

export function buildSiteChartRows(
  sortedForTable: NetworkStat[],
  yMetric: SiteChartYMetric
): AnalyticsMetricBarRow[] {
  return sortedForTable
    .map((s) => {
      const v = siteChartYValue(s, yMetric);
      if (v === null || Number.isNaN(v)) return null;
      return {
        key: s.network,
        shortLabel: s.label.length > 16 ? `${s.label.slice(0, 14)}…` : s.label,
        fullLabel: s.label,
        value: v,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
}

export function buildTierChartRows(
  sortedForTable: TierStat[],
  yMetric: SiteChartYMetric
): AnalyticsMetricBarRow[] {
  return sortedForTable
    .map((s) => {
      const v = siteChartYValue(s, yMetric);
      if (v === null || Number.isNaN(v)) return null;
      return {
        key: s.tier,
        shortLabel: s.label.length > 22 ? `${s.label.slice(0, 20)}…` : s.label,
        fullLabel: s.label,
        value: v,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
}

export function tierAnalyticsChartTitle(yMetric: SiteChartYMetric, periodLabel: string): string {
  const metricMeta = SITE_CHART_Y_METRICS.find((m) => m.id === yMetric)!;
  return `${metricMeta.label} por tier (${periodLabel})`;
}

export function siteAnalyticsChartTitle(
  yMetric: SiteChartYMetric,
  periodLabel: string,
  selectionSummary: string
): string {
  const metricMeta = SITE_CHART_Y_METRICS.find((m) => m.id === yMetric)!;
  return `${metricMeta.label} por rede (${periodLabel}) — ${selectionSummary}`;
}

export function isSiteChartHeuristicMetric(yMetric: SiteChartYMetric): boolean {
  return yMetric === "itm" || yMetric === "earlyFinish" || yMetric === "lateFinish";
}
