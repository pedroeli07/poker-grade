import { getCachedSharkscopeAnalytics } from "@/lib/data/sharkscope-analytics";
import { sharkscopeStatsHasData } from "@/lib/utils";
import type { AnalyticsClientProps } from "@/lib/types";

export async function loadAnalyticsClientProps(): Promise<AnalyticsClientProps> {
  const { stats30d, stats90d, ranking, tierStats30d, typeStats30d } =
    await getCachedSharkscopeAnalytics();
  return {
    stats30d,
    stats90d,
    ranking,
    tierStats30d,
    typeStats30d,
    hasData30d: sharkscopeStatsHasData(stats30d),
    hasData90d: sharkscopeStatsHasData(stats90d),
  };
}
