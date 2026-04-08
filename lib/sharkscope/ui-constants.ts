import type {
  SharkscopeAnalyticsPeriod,
  SharkscopeAnalyticsTab,
} from "@/lib/types";

export const SHARKSCOPE_ANALYTICS_PERIODS: readonly SharkscopeAnalyticsPeriod[] = [
  "30d",
  "90d",
];

export const SHARKSCOPE_ANALYTICS_TAB_LABELS: Record<string, string> = {
  site: "Por Site",
  ranking: "Ranking (30d)",
  tier: "Por TIER",
  bounty: "Bounty vs Vanilla",
};

export const SHARKSCOPE_NLQ_TIMEZONE = "America/Sao_Paulo";
