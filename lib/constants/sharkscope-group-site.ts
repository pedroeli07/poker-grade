import { SHARKSCOPE_STATS_FILTER_30D, SHARKSCOPE_STATS_FILTER_90D } from "@/lib/constants/sharkscope-type-filters";

/** Cache `dataType` — agregado por rede a partir de `completedTournaments` do Player Group. */
export const SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D = "group_site_breakdown_30d" as const;
export const SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D = "group_site_breakdown_90d" as const;

export const SHARKSCOPE_GROUP_SITE_FILTER_KEYS = {
  "30d": SHARKSCOPE_STATS_FILTER_30D,
  "90d": SHARKSCOPE_STATS_FILTER_90D,
} as const;

/** Máximo de páginas (100 torneios cada) por grupo e período no cron. */
export function sharkscopeSiteMaxPages(): number {
  const raw = process.env.SHARKSCOPE_SITE_MAX_PAGES;
  const n = raw ? parseInt(raw, 10) : 30;
  return Number.isFinite(n) && n > 0 ? Math.min(n, 500) : 30;
}

/** Se true, o cron também sincroniza `stats_30d`/`stats_90d` por nick×rede (custo alto). Por defeito desligado. */
export function sharkscopeSyncSiteNicksEnabled(): boolean {
  const v = process.env.SHARKSCOPE_SYNC_SITE_NICKS?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** Se true e não houver dados `group_site_breakdown_*`, o analytics usa caches antigos por nick×rede. Por defeito false. */
export function sharkscopeAnalyticsSiteFallbackNicks(): boolean {
  const v = process.env.SHARKSCOPE_ANALYTICS_SITE_FALLBACK_NICKS?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
