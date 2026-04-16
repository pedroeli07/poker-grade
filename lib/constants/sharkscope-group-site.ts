import { SHARKSCOPE_STATS_FILTER_30D, SHARKSCOPE_STATS_FILTER_90D } from "@/lib/constants/sharkscope-type-filters";
import type { SharkScopeSyncMode } from "@/lib/types/sharkScopeTypes";

/** Query extra em `completedTournaments` — uma linha por entrada/reentrada (alinha volume/ROI ao site). */
export const SHARKSCOPE_COMPLETED_TOURNAMENTS_EXPAND_MULTI =
  "expandMultiEntries=true" as const;

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
 * Modo do cron `GET /api/cron/daily-sync?mode=…` ou `SHARKSCOPE_CRON_SYNC_MODE`:
 * - `players` — só `Date:10D` (alinhado à tabela de jogadores; mais barato).
 * - `light` — lifetime + 10d/30d/90d, sem CT.
 * - `analytics` — lifetime + 30d/90d + CT + breakdown (sem refetch 10d).
 * - `analytics_nick` — 30d/90d grupo + nick×rede; sem CT (económico).
 * - `full` — tudo (4 períodos + CT).
 */
export function sharkscopeCronSyncMode(): SharkScopeSyncMode {
  const v = process.env.SHARKSCOPE_CRON_SYNC_MODE?.trim().toLowerCase();
  if (v === "full") return "full";
  if (v === "players") return "players";
  if (v === "analytics") return "analytics";
  if (v === "analytics_nick") return "analytics_nick";
  return "light";
}

/**
 * Por site: preferir caches `statistics` por nick×rede (barato) em vez de `group_site_breakdown_*` (CT).
 * Desligar com `SHARKSCOPE_ANALYTICS_SITE_BY_NICK=0` para forçar só agregado do Player Group.
 */
export function sharkscopeAnalyticsSiteByNick(): boolean {
  const v = process.env.SHARKSCOPE_ANALYTICS_SITE_BY_NICK?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "no") return false;
  return true;
}

/** Cache `dataType` — agregado por rede a partir de `completedTournaments` do Player Group. */
export const SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D = "group_site_breakdown_30d" as const;
export const SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D = "group_site_breakdown_90d" as const;

export const SHARKSCOPE_GROUP_SITE_FILTER_KEYS = {
  "30d": SHARKSCOPE_STATS_FILTER_30D,
  "90d": SHARKSCOPE_STATS_FILTER_90D,
} as const;

/**
 * Teto de páginas no `completedTournaments` (100 torneios por página, `order=Last`).
 * O loop pára antes quando a API devolve menos de 100 torneios (fim natural). Este valor é só **proteção**
 * contra loop infinito e, por defeito, é alto o suficiente para cobrir praticamente qualquer volume em 90d.
 *
 * Defina `SHARKSCOPE_SITE_MAX_PAGES` no env para **limitar** buscas/custo (ex.: `10` = 1000 torneios).
 */
const DEFAULT_SITE_MAX_PAGES = 10_000;
const ABSOLUTE_MAX_PAGES = 100_000;

export function sharkscopeSiteMaxPages(): number {
  const raw = process.env.SHARKSCOPE_SITE_MAX_PAGES?.trim();
  if (!raw) {
    return DEFAULT_SITE_MAX_PAGES;
  }
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) {
    return DEFAULT_SITE_MAX_PAGES;
  }
  return Math.min(n, ABSOLUTE_MAX_PAGES);
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
