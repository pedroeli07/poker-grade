import type { NetworkStat } from "@/lib/types";
import type { SharkscopeAnalyticsPeriod } from "@/lib/types";

export function sharkscopeStatsHasData(stats: NetworkStat[]): boolean {
  return stats.some((s) => s.roi !== null || s.profit !== null);
}

export function pickSharkscopeStatsByPeriod(
  period: SharkscopeAnalyticsPeriod,
  stats30d: NetworkStat[],
  stats90d: NetworkStat[]
): NetworkStat[] {
  return period === "30d" ? stats30d : stats90d;
}
