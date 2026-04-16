import { useMemo, useState } from "react";
import { distinctOptions } from "@/lib/utils";
import {
  ANALYTICS_NUM_FILTER_KEYS,
  buildUniqueValuesMap,
  BOUNTY_TYPE_UNIQUE_FIELDS,
  RANKING_UNIQUE_FIELDS,
  SITE_NETWORK_UNIQUE_FIELDS,
  TIER_UNIQUE_FIELDS,
} from "@/lib/analytics-unique-values";
import { useAnalyticsFilter } from "@/lib/use-analytics-filter";
import { useAnalyticsBountyStore } from "@/lib/stores/use-analytics-bounty-store";
import { useAnalyticsRankingStore } from "@/lib/stores/use-analytics-ranking-store";
import { useAnalyticsSiteStore } from "@/lib/stores/use-analytics-site-store";
import { useAnalyticsTierStore } from "@/lib/stores/use-analytics-tier-store";
import { SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT } from "@/lib/constants/sharkscope/analytics";
import { useAnalyticsSortedRows } from "@/hooks/sharkscope/analytics/use-analytics-sorted-rows";
import useAnalyticsColumnSort from "@/hooks/sharkscope/analytics/use-analytics-column-sort";
import type {
  TypeStat,
  RankingEntry,
  NetworkStat,
  TierStat,
  SharkscopeAnalyticsPeriod,
  TierSortKey,
} from "@/lib/types";
import {
  buildTierChartRows,
  siteAnalyticsPeriodLabel,
  siteChartFormattersForMetric,
  sortBountyTypeRows,
  sortRankingRows,
  sortTierRows,
  tierAnalyticsChartTitle,
} from "@/lib/utils/sharkscope/analytics";
import { SITE_CHART_Y_METRICS, type SiteChartYMetric } from "@/lib/site-analytics-chart";

const ANALYTICS_NUM_FILTER_KEY_LIST = [...ANALYTICS_NUM_FILTER_KEYS] as string[];

function useBountyAnalytics(typeStats: TypeStat[]) {
  const { filters, setColumnFilter } = useAnalyticsBountyStore();
  const { numFilters, setNumFilter, setCol, filtered } = useAnalyticsFilter(
    typeStats,
    filters,
    setColumnFilter,
    ANALYTICS_NUM_FILTER_KEY_LIST
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

  const uniqueValues = useMemo(
    () => buildUniqueValuesMap(typeStats, BOUNTY_TYPE_UNIQUE_FIELDS),
    [typeStats]
  );

  const { sort, toggleSort, sorted } = useAnalyticsSortedRows(filtered, sortBountyTypeRows);

  return {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    filtered,
    typeOptions,
    barRows,
    uniqueRois: uniqueValues.rois,
    uniqueEntries: uniqueValues.entries,
    uniqueProfits: uniqueValues.profits,
    uniqueItms: uniqueValues.itms,
    uniqueAbilities: uniqueValues.abilities,
    uniqueStakes: uniqueValues.stakes,
    uniqueEarly: uniqueValues.early,
    uniqueLate: uniqueValues.late,
    sort,
    toggleSort,
    sorted,
  };
}

function useRankingAnalytics(ranking: RankingEntry[]) {
  const { filters, setColumnFilter } = useAnalyticsRankingStore();
  const { numFilters, setNumFilter, setCol, filtered } = useAnalyticsFilter(
    ranking,
    filters,
    setColumnFilter,
    ANALYTICS_NUM_FILTER_KEY_LIST
  );

  const playerOptions = useMemo(
    () => distinctOptions(ranking, (r) => ({ value: r.player.name, label: r.player.name })),
    [ranking]
  );

  const uniqueValues = useMemo(
    () => buildUniqueValuesMap(ranking, RANKING_UNIQUE_FIELDS),
    [ranking]
  );

  const { sort, toggleSort, sorted } = useAnalyticsSortedRows(filtered, sortRankingRows);

  return {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    filtered,
    playerOptions,
    uniqueRois: uniqueValues.rois,
    uniqueEntries: uniqueValues.entries,
    uniqueProfits: uniqueValues.profits,
    uniqueItms: uniqueValues.itms,
    uniqueAbilities: uniqueValues.abilities,
    uniqueStakes: uniqueValues.stakes,
    uniqueEarly: uniqueValues.early,
    uniqueLate: uniqueValues.late,
    sort,
    toggleSort,
    sorted,
  };
}

function useSiteAnalytics(stats: NetworkStat[]) {
  const { filters, setColumnFilter } = useAnalyticsSiteStore();
  const { numFilters, setNumFilter, setCol, filtered } = useAnalyticsFilter(
    stats,
    filters,
    setColumnFilter,
    ANALYTICS_NUM_FILTER_KEY_LIST
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

  const uniqueValues = useMemo(
    () => buildUniqueValuesMap(stats, SITE_NETWORK_UNIQUE_FIELDS),
    [stats]
  );

  return {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    filtered,
    networkOptions,
    barRows,
    uniqueRois: uniqueValues.rois,
    uniqueProfits: uniqueValues.profits,
    uniqueItms: uniqueValues.itms,
    uniqueEarly: uniqueValues.early,
    uniqueLate: uniqueValues.late,
    uniqueEntries: uniqueValues.entries,
    uniqueAbilities: uniqueValues.abilities,
    uniqueAvStakes: uniqueValues.avStakes,
  };
}

function useTierAnalytics(tierStats: TierStat[], period: SharkscopeAnalyticsPeriod) {
  const { filters, setColumnFilter } = useAnalyticsTierStore();
  const { numFilters, setNumFilter, setCol, filtered } = useAnalyticsFilter(
    tierStats,
    filters,
    setColumnFilter,
    ANALYTICS_NUM_FILTER_KEY_LIST
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

  const uniqueValues = useMemo(
    () => buildUniqueValuesMap(tierStats, TIER_UNIQUE_FIELDS),
    [tierStats]
  );
  const {
    rois: uniqueRois,
    profits: uniqueProfits,
    itms: uniqueItms,
    early: uniqueEarly,
    late: uniqueLate,
    entries: uniqueEntries,
    abilities: uniqueAbilities,
    avStakes: uniqueAvStakes,
  } = uniqueValues;

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

export { useBountyAnalytics, useRankingAnalytics, useSiteAnalytics, useTierAnalytics };
