import { SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT } from "@/lib/constants/sharkscope/analytics/sharkscope-analytics-labels";
import type {
  NetworkStat,
  RankingEntry,
  TierStat,
  TypeStat,
} from "@/lib/types";
import type {
  AnalyticsSortState,
  BountySortKey,
  RankingSortKey,
  SiteTableSortKey,
  TierSortKey,
} from "@/lib/types/sharkscopeAnalyticsUi";
import {
  compareNumber,
  compareNumberNullsLast,
  compareString,
  type SortDir,
} from "@/lib/table-sort";

const TIER_ORDER: Record<string, number> = {
  micro: 0,
  low: 1,
  lowMid: 2,
  mid: 3,
  high: 4,
};

function compareTier(a: string, b: string, dir: SortDir): number {
  const oa = TIER_ORDER[a] ?? 99;
  const ob = TIER_ORDER[b] ?? 99;
  const d = oa - ob;
  if (d !== 0) return dir === "asc" ? d : -d;
  return compareString(a, b, dir);
}

export function sortBountyTypeRows(
  rows: TypeStat[],
  sort: AnalyticsSortState<BountySortKey>
): TypeStat[] {
  if (!sort) return rows;
  const { key, dir } = sort;
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (key) {
      case "type":
        return compareString(
          SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[a.type],
          SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[b.type],
          dir
        );
      case "roi":
        return compareNumberNullsLast(a.roi, b.roi, dir);
      case "entries":
        return compareNumberNullsLast(a.entries, b.entries, dir);
      case "profit":
        return compareNumberNullsLast(a.profit, b.profit, dir);
      case "itm":
        return compareNumberNullsLast(a.itm, b.itm, dir);
      case "ability":
        return compareNumberNullsLast(a.ability, b.ability, dir);
      case "avStake":
        return compareNumberNullsLast(a.avStake, b.avStake, dir);
      case "earlyFinish":
        return compareNumberNullsLast(a.earlyFinish, b.earlyFinish, dir);
      case "lateFinish":
        return compareNumberNullsLast(a.lateFinish, b.lateFinish, dir);
      default:
        return 0;
    }
  });
  return copy;
}

export function sortRankingRows(
  rows: RankingEntry[],
  sort: AnalyticsSortState<RankingSortKey>
): RankingEntry[] {
  if (!sort) return rows;
  const { key, dir } = sort;
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (key) {
      case "player":
        return compareString(a.player.name, b.player.name, dir);
      case "roi":
        return compareNumber(a.roi, b.roi, dir);
      case "entries":
        return compareNumberNullsLast(a.entries, b.entries, dir);
      case "profit":
        return compareNumberNullsLast(a.profit, b.profit, dir);
      case "itm":
        return compareNumberNullsLast(a.itm, b.itm, dir);
      case "ability":
        return compareNumberNullsLast(a.ability, b.ability, dir);
      case "avStake":
        return compareNumberNullsLast(a.avStake, b.avStake, dir);
      case "earlyFinish":
        return compareNumberNullsLast(a.earlyFinish, b.earlyFinish, dir);
      case "lateFinish":
        return compareNumberNullsLast(a.lateFinish, b.lateFinish, dir);
      default:
        return 0;
    }
  });
  return copy;
}

export function sortTierRows(rows: TierStat[], sort: AnalyticsSortState<TierSortKey>): TierStat[] {
  if (!sort) return rows;
  const { key, dir } = sort;
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (key) {
      case "tier":
        return compareTier(a.tier, b.tier, dir);
      case "roi":
        return compareNumberNullsLast(a.roi, b.roi, dir);
      case "entries":
        return compareNumberNullsLast(a.entries, b.entries, dir);
      case "profit":
        return compareNumberNullsLast(a.profit, b.profit, dir);
      case "itm":
        return compareNumberNullsLast(a.itm, b.itm, dir);
      case "ability":
        return compareNumberNullsLast(a.ability, b.ability, dir);
      case "avStake":
        return compareNumberNullsLast(a.avStake, b.avStake, dir);
      case "earlyFinish":
        return compareNumberNullsLast(a.earlyFinish, b.earlyFinish, dir);
      case "lateFinish":
        return compareNumberNullsLast(a.lateFinish, b.lateFinish, dir);
      default:
        return 0;
    }
  });
  return copy;
}

export function sortSiteNetworkRows(
  rows: NetworkStat[],
  sort: AnalyticsSortState<SiteTableSortKey>
): NetworkStat[] {
  if (!sort) return rows;
  const { key, dir } = sort;
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (key) {
      case "network":
        return compareString(a.label, b.label, dir);
      case "roi":
        return compareNumberNullsLast(a.roi, b.roi, dir);
      case "entries":
        return compareNumberNullsLast(a.entries, b.entries, dir);
      case "profit":
        return compareNumberNullsLast(a.profit, b.profit, dir);
      case "itm":
        return compareNumberNullsLast(a.itm ?? null, b.itm ?? null, dir);
      case "ability":
        return compareNumberNullsLast(a.ability ?? null, b.ability ?? null, dir);
      case "avStake":
        return compareNumberNullsLast(a.avStake ?? null, b.avStake ?? null, dir);
      case "earlyFinish":
        return compareNumberNullsLast(a.earlyFinish ?? null, b.earlyFinish ?? null, dir);
      case "lateFinish":
        return compareNumberNullsLast(a.lateFinish ?? null, b.lateFinish ?? null, dir);
      default:
        return 0;
    }
  });
  return copy;
}
