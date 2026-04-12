import { useMemo } from "react";
import { distinctOptions } from "@/lib/utils";
import { getUniqueValues } from "@/lib/match-number-filter";
import { useAnalyticsFilter } from "@/lib/use-analytics-filter";
import { useAnalyticsBountyStore } from "@/lib/stores/use-analytics-bounty-store";
import { useAnalyticsRankingStore } from "@/lib/stores/use-analytics-ranking-store";
import { useAnalyticsSiteStore } from "@/lib/stores/use-analytics-site-store";
import { useAnalyticsTierStore } from "@/lib/stores/use-analytics-tier-store";
import { SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT } from "@/lib/constants/sharkscope-analytics-labels";
import type { TypeStat, RankingEntry, NetworkStat, TierStat } from "@/lib/types";

export function useBountyAnalytics(typeStats30d: TypeStat[]) {
  const { filters, setColumnFilter } = useAnalyticsBountyStore();
  const { numFilters, setNumFilter, setCol, filtered } = useAnalyticsFilter(
    typeStats30d,
    filters,
    setColumnFilter,
    ["roi", "roiWeighted", "profit", "count"]
  );

  const typeOptions = useMemo(
    () =>
      distinctOptions(typeStats30d, (s) => ({
        value: s.type,
        label: SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type],
      })),
    [typeStats30d]
  );

  const barRows = useMemo(
    () =>
      filtered.map((s) => ({
        key: s.type,
        shortLabel: SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type],
        fullLabel: SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type],
        roi: s.roiWeighted,
      })),
    [filtered]
  );

  const uniqueRois = useMemo(() => getUniqueValues(typeStats30d, (s) => s.roi), [typeStats30d]);
  const uniqueRoiWeighted = useMemo(() => getUniqueValues(typeStats30d, (s) => s.roiWeighted), [typeStats30d]);
  const uniqueProfits = useMemo(() => getUniqueValues(typeStats30d, (s) => s.profit), [typeStats30d]);
  const uniqueCounts = useMemo(() => getUniqueValues(typeStats30d, (s) => s.count), [typeStats30d]);

  return {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    filtered,
    typeOptions,
    barRows,
    uniqueRois,
    uniqueRoiWeighted,
    uniqueProfits,
    uniqueCounts,
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
  };
}

export function useSiteAnalytics(stats: NetworkStat[]) {
  const { filters, setColumnFilter } = useAnalyticsSiteStore();
  const { numFilters, setNumFilter, setCol, filtered } = useAnalyticsFilter(
    stats,
    filters,
    setColumnFilter,
    ["roi", "profit", "itm", "earlyFinish", "lateFinish", "count"]
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
  const uniqueCounts = useMemo(() => getUniqueValues(stats, (s) => s.count), [stats]);

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
    uniqueCounts,
  };
}

export function useTierAnalytics(tierStats: TierStat[]) {
  const { filters, setColumnFilter } = useAnalyticsTierStore();
  const { numFilters, setNumFilter, setCol, filtered } = useAnalyticsFilter(
    tierStats,
    filters,
    setColumnFilter,
    ["roi", "roiWeighted", "profit", "count", "players"]
  );

  const tierOptions = useMemo(
    () => distinctOptions(tierStats, (s) => ({ value: s.tier, label: s.tier })),
    [tierStats]
  );

  const barRows = useMemo(
    () =>
      filtered.map((s) => ({
        key: s.tier,
        shortLabel: s.tier,
        fullLabel: `Tier ${s.tier} (Low / Mid / High)`,
        roi: s.roiWeighted,
      })),
    [filtered]
  );

  const uniqueRois = useMemo(() => getUniqueValues(tierStats, (s) => s.roi), [tierStats]);
  const uniqueRoiWeighted = useMemo(() => getUniqueValues(tierStats, (s) => s.roiWeighted), [tierStats]);
  const uniqueProfits = useMemo(() => getUniqueValues(tierStats, (s) => s.profit), [tierStats]);
  const uniqueCounts = useMemo(() => getUniqueValues(tierStats, (s) => s.count), [tierStats]);
  const uniquePlayers = useMemo(() => getUniqueValues(tierStats, (s) => s.players), [tierStats]);

  return {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    filtered,
    tierOptions,
    barRows,
    uniqueRois,
    uniqueRoiWeighted,
    uniqueProfits,
    uniqueCounts,
    uniquePlayers,
  };
}
