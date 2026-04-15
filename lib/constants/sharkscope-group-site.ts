import { SHARKSCOPE_STATS_FILTER_30D, SHARKSCOPE_STATS_FILTER_90D } from "@/lib/constants/sharkscope-type-filters";

/** IDs pedidos em `.../statistics/{ids}` para Player Group (alinhado ao site / GET metadata). */
export const SHARKSCOPE_PLAYER_GROUP_STATS_IDS =
  "Entries,Count,TotalROI,AvROI,ITM,TotalProfit,Profit,AvStake,Ability,AvEntrants,FinshesEarly,FinshesLate,Entrants" as const;

/** Path `GET .../statistics/{ids}` para um Player Group; `filterBody` ex.: `Date:10D` (não incluir `?filter=`). */
export function playerGroupStatisticsPath(groupName: string, filterBody?: string): string {
  const base = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/statistics/${SHARKSCOPE_PLAYER_GROUP_STATS_IDS}`;
  if (!filterBody?.trim()) return base;
  return `${base}?filter=${encodeURIComponent(filterBody.trim())}`;
}

/**
 * Modo do cron `GET /api/cron/daily-sync`: `light` = só `statistics` (10d/30d/90d + lifetime), sem `completedTournaments`.
 * `full` = statistics + paginação CT (breakdown por rede). O custo em “buscas” do endpoint `statistics` com filtro
 * depende do plano SharkScope — comparar `UserInfo.RemainingSearches` antes/depois ou documentação comercial.
 */
export function sharkscopeCronSyncMode(): "full" | "light" {
  const v = process.env.SHARKSCOPE_CRON_SYNC_MODE?.trim().toLowerCase();
  if (v === "full") return "full";
  return "light";
}

/** Cache `dataType` — agregado por rede a partir de `completedTournaments` do Player Group. */
export const SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D = "group_site_breakdown_30d" as const;
export const SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D = "group_site_breakdown_90d" as const;

export const SHARKSCOPE_GROUP_SITE_FILTER_KEYS = {
  "30d": SHARKSCOPE_STATS_FILTER_30D,
  "90d": SHARKSCOPE_STATS_FILTER_90D,
} as const;

/** Máximo de páginas (100 torneios cada) por grupo no cron. Default reduzido para 5 (500 torneios em 90d). */
export function sharkscopeSiteMaxPages(): number {
  const raw = process.env.SHARKSCOPE_SITE_MAX_PAGES;
  const n = raw ? parseInt(raw, 10) : 5;
  return Number.isFinite(n) && n > 0 ? Math.min(n, 500) : 5;
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
