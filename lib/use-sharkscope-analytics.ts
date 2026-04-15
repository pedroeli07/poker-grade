import { useMemo, useState } from "react";
import { distinctOptions } from "@/lib/utils";
import { getUniqueValues } from "@/lib/match-number-filter";
import { useAnalyticsFilter } from "@/lib/use-analytics-filter";
import { useAnalyticsBountyStore } from "@/lib/stores/use-analytics-bounty-store";
import { useAnalyticsRankingStore } from "@/lib/stores/use-analytics-ranking-store";
import { useAnalyticsSiteStore } from "@/lib/stores/use-analytics-site-store";
import { useAnalyticsTierStore } from "@/lib/stores/use-analytics-tier-store";
import { SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT } from "@/lib/constants/sharkscope/analytics/sharkscope-analytics-labels";
import { useAnalyticsSortedRows } from "@/hooks/sharkscope/analytics/use-analytics-sorted-rows";
import useAnalyticsColumnSort from "@/hooks/sharkscope/analytics/use-analytics-column-sort";
import type { TypeStat, RankingEntry, NetworkStat, TierStat, SharkscopeAnalyticsPeriod } from "@/lib/types";
import type { TierSortKey } from "@/lib/types/sharkscopeAnalyticsUi";
import {
  sortBountyTypeRows,
  sortRankingRows,
  sortTierRows,
} from "@/lib/utils/sharlscope/analytics/sharkscope-analytics-table-sort";
import {
  buildTierChartRows,
  siteAnalyticsPeriodLabel,
  tierAnalyticsChartTitle,
} from "@/lib/utils/sharlscope/analytics/site-analytics-site-panel";
import { SITE_CHART_Y_METRICS, type SiteChartYMetric } from "@/lib/site-analytics-chart";
import { siteChartFormattersForMetric } from "@/lib/utils/sharlscope/analytics/site-analytics-panel-format";

export function useBountyAnalytics(typeStats: TypeStat[]) {
  const { filters, setColumnFilter } = useAnalyticsBountyStore();
  const { numFilters, setNumFilter, setCol, filtered } = useAnalyticsFilter(
    typeStats,
    filters,
    setColumnFilter,
    ["roi", "entries", "profit", "itm", "ability", "avStake", "earlyFinish", "lateFinish"]
  );

  const typeOptions = useMemo(
    () =>
      distinctOptions(typeStats, (s) => ({
        value: s.type,
        label: SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type],
      })),
    [typeStats]
  );

  const barRows = useMemo(
    () =>
      filtered.map((s) => ({
        key: s.type,
        shortLabel: SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type],
        fullLabel: SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type],
        roi: s.roi ?? s.roiWeighted,
      })),
    [filtered]
  );

  const uniqueRois = useMemo(() => getUniqueValues(typeStats, (s) => s.roi), [typeStats]);
  const uniqueEntries = useMemo(() => getUniqueValues(typeStats, (s) => s.entries), [typeStats]);
  const uniqueProfits = useMemo(() => getUniqueValues(typeStats, (s) => s.profit), [typeStats]);
  const uniqueItms = useMemo(() => getUniqueValues(typeStats, (s) => s.itm), [typeStats]);
  const uniqueAbilities = useMemo(() => getUniqueValues(typeStats, (s) => s.ability), [typeStats]);
  const uniqueStakes = useMemo(() => getUniqueValues(typeStats, (s) => s.avStake), [typeStats]);
  const uniqueEarly = useMemo(() => getUniqueValues(typeStats, (s) => s.earlyFinish), [typeStats]);
  const uniqueLate = useMemo(() => getUniqueValues(typeStats, (s) => s.lateFinish), [typeStats]);

  const { sort, toggleSort, sorted } = useAnalyticsSortedRows(filtered, sortBountyTypeRows);

  return {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    filtered,
    typeOptions,
    barRows,
    uniqueRois,
    uniqueEntries,
    uniqueProfits,
    uniqueItms,
    uniqueAbilities,
    uniqueStakes,
    uniqueEarly,
    uniqueLate,
    sort,
    toggleSort,
    sorted,
  };
}

export function useRankingAnalytics(ranking: RankingEntry[]) {
  const { filters, setColumnFilter } = useAnalyticsRankingStore();
  const { numFilters, setNumFilter, setCol, filtered } = useAnalyticsFilter(
    ranking,
    filters,
    setColumnFilter,
    ["roi", "entries", "profit", "itm", "ability", "avStake", "earlyFinish", "lateFinish"]
  );

  const playerOptions = useMemo(
    () => distinctOptions(ranking, (r) => ({ value: r.player.name, label: r.player.name })),
    [ranking]
  );

  const uniqueRois = useMemo(() => getUniqueValues(ranking, (r) => r.roi), [ranking]);
  const uniqueEntries = useMemo(() => getUniqueValues(ranking, (r) => r.entries), [ranking]);
  const uniqueProfits = useMemo(() => getUniqueValues(ranking, (r) => r.profit), [ranking]);
  const uniqueItms = useMemo(() => getUniqueValues(ranking, (r) => r.itm), [ranking]);
  const uniqueAbilities = useMemo(() => getUniqueValues(ranking, (r) => r.ability), [ranking]);
  const uniqueStakes = useMemo(() => getUniqueValues(ranking, (r) => r.avStake), [ranking]);
  const uniqueEarly = useMemo(() => getUniqueValues(ranking, (r) => r.earlyFinish), [ranking]);
  const uniqueLate = useMemo(() => getUniqueValues(ranking, (r) => r.lateFinish), [ranking]);

  const { sort, toggleSort, sorted } = useAnalyticsSortedRows(filtered, sortRankingRows);

  return {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    filtered,
    playerOptions,
    uniqueRois,
    uniqueEntries,
    uniqueProfits,
    uniqueItms,
    uniqueAbilities,
    uniqueStakes,
    uniqueEarly,
    uniqueLate,
    sort,
    toggleSort,
    sorted,
  };
}

export function useSiteAnalytics(stats: NetworkStat[]) {
  const { filters, setColumnFilter } = useAnalyticsSiteStore();
  const { numFilters, setNumFilter, setCol, filtered } = useAnalyticsFilter(
    stats,
    filters,
    setColumnFilter,
    ["roi", "entries", "profit", "itm", "ability", "avStake", "earlyFinish", "lateFinish"]
  );

  const networkOptions = useMemo(
    () => distinctOptions(stats, (s) => ({ value: s.network, label: s.label })),
    [stats]
  );

  const barRows = useMemo(
    () =>
      filtered.map((s) => ({
        key: s.network,
        shortLabel: s.label.length > 16 ? `${s.label.slice(0, 14)}…` : s.label,
        fullLabel: s.label,
        roi: s.roiWeighted,
      })),
    [filtered]
  );

  const uniqueRois = useMemo(() => getUniqueValues(stats, (s) => s.roi), [stats]);
  const uniqueProfits = useMemo(() => getUniqueValues(stats, (s) => s.profit), [stats]);
  const uniqueItms = useMemo(() => getUniqueValues(stats, (s) => s.itm ?? null), [stats]);
  const uniqueEarly = useMemo(() => getUniqueValues(stats, (s) => s.earlyFinish ?? null), [stats]);
  const uniqueLate = useMemo(() => getUniqueValues(stats, (s) => s.lateFinish ?? null), [stats]);
  const uniqueEntries = useMemo(() => getUniqueValues(stats, (s) => s.entries), [stats]);
  const uniqueAbilities = useMemo(() => getUniqueValues(stats, (s) => s.ability ?? null), [stats]);
  const uniqueAvStakes = useMemo(() => getUniqueValues(stats, (s) => s.avStake ?? null), [stats]);

  return {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    filtered,
    networkOptions,
    barRows,
    uniqueRois,
    uniqueProfits,
    uniqueItms,
    uniqueEarly,
    uniqueLate,
    uniqueEntries,
    uniqueAbilities,
    uniqueAvStakes,
  };
}

export function useTierAnalytics(tierStats: TierStat[], period: SharkscopeAnalyticsPeriod) {
  const { filters, setColumnFilter } = useAnalyticsTierStore();
  const { numFilters, setNumFilter, setCol, filtered } = useAnalyticsFilter(
    tierStats,
    filters,
    setColumnFilter,
    ["roi", "entries", "profit", "itm", "ability", "avStake", "earlyFinish", "lateFinish"]
  );

  const { sort: tableSort, toggleSort: toggleTableSort } = useAnalyticsColumnSort<TierSortKey>();

  const sortedForTable = useMemo(
    () => sortTierRows(filtered, tableSort),
    [filtered, tableSort]
  );

  const tierOptions = useMemo(
    () => distinctOptions(tierStats, (s) => ({ value: s.tier, label: s.label })),
    [tierStats]
  );

  const [yMetric, setYMetric] = useState<SiteChartYMetric>("profit");

  const metricMeta = useMemo(() => SITE_CHART_Y_METRICS.find((m) => m.id === yMetric)!, [yMetric]);

  const { tickFormatter, tooltipFormatter } = useMemo(
    () => siteChartFormattersForMetric(yMetric),
    [yMetric]
  );

  const chartRows = useMemo(
    () => buildTierChartRows(sortedForTable, yMetric),
    [sortedForTable, yMetric]
  );

  const periodLabel = useMemo(() => siteAnalyticsPeriodLabel(period), [period]);

  const chartTitle = useMemo(
    () => tierAnalyticsChartTitle(yMetric, periodLabel),
    [yMetric, periodLabel]
  );

  const chartHeuristicNote = useMemo(
    () => yMetric === "itm" || yMetric === "earlyFinish" || yMetric === "lateFinish",
    [yMetric]
  );

  const uniqueRois = useMemo(() => getUniqueValues(tierStats, (s) => s.roi), [tierStats]);
  const uniqueProfits = useMemo(() => getUniqueValues(tierStats, (s) => s.profit), [tierStats]);
  const uniqueItms = useMemo(() => getUniqueValues(tierStats, (s) => s.itm), [tierStats]);
  const uniqueEarly = useMemo(() => getUniqueValues(tierStats, (s) => s.earlyFinish), [tierStats]);
  const uniqueLate = useMemo(() => getUniqueValues(tierStats, (s) => s.lateFinish), [tierStats]);
  const uniqueEntries = useMemo(() => getUniqueValues(tierStats, (s) => s.entries), [tierStats]);
  const uniqueAbilities = useMemo(() => getUniqueValues(tierStats, (s) => s.ability), [tierStats]);
  const uniqueAvStakes = useMemo(() => getUniqueValues(tierStats, (s) => s.avStake), [tierStats]);

  return {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    filtered,
    tierOptions,
    uniqueRois,
    uniqueProfits,
    uniqueItms,
    uniqueEarly,
    uniqueLate,
    uniqueEntries,
    uniqueAbilities,
    uniqueAvStakes,
    tableSort,
    toggleTableSort,
    sortedForTable,
    yMetric,
    setYMetric,
    metricMeta,
    tickFormatter,
    tooltipFormatter,
    chartRows,
    chartTitle,
    chartHeuristicNote,
  };
}
