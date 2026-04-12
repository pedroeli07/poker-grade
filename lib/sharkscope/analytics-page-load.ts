import { getCachedSharkscopeAnalytics } from "@/lib/data/sharkscope-analytics";
import { sharkscopeStatsHasData } from "@/lib/utils";
import type { AnalyticsClientProps } from "@/lib/types";

export async function loadAnalyticsClientProps(): Promise<AnalyticsClientProps> {
  const {
    stats30d,
    stats90d,
    siteAnalytics30d,
    siteAnalytics90d,
    ranking30d,
    ranking90d,
    tierStats30d,
    tierStats90d,
    typeStats30d,
  } = await getCachedSharkscopeAnalytics();

  return {
    stats30d,
    stats90d,
    siteAnalytics30d,
    siteAnalytics90d,
    ranking30d,
    ranking90d,
    tierStats30d,
    tierStats90d,
    typeStats30d,
    hasData30d: sharkscopeStatsHasData(stats30d),
    hasData90d: sharkscopeStatsHasData(stats90d),
  };
}
