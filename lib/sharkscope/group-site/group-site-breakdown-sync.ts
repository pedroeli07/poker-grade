import { sharkScopeGet } from "@/lib/utils/sharkscope-client";
import { getOrFetchSharkScope } from "@/lib/sharkscope-cache";
import { aggregateRows, filterTournamentRows } from "@/lib/sharkscope/completed-tournaments-aggregate";
import type { GroupSiteBreakdownPayloadV3, TournamentRow } from "@/lib/types/sharkscope/completed-tournaments";
import type { GroupSiteFetch90dResult } from "@/lib/types/sharkscope/group-site";
import type { SharkScopeGetFn } from "@/lib/types/sharkscope/group-sync";
import {
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D,
  SHARKSCOPE_GROUP_SITE_FILTER_KEYS,
  sharkscopeSiteMaxPages,
} from "@/lib/constants/sharkscope/group-site";
import { createLogger } from "@/lib/logger";
import { daysAgoTimestamp } from "@/lib/sharkscope/daily-sync/sync-abort";
import { mergedPlayerToRecord, upsertGroupSiteBreakdown30dCache } from "@/lib/sharkscope/group-site/group-site-breakdown-helpers";
import { paginatePlayerGroupCompletedTournaments } from "@/lib/sharkscope/group-site/group-site-live-fetch";

const log = createLogger("sharkscope.group-site-breakdown");

async function fetch90dCompletedTournamentPages(
  groupName: string,
  fetchFn: SharkScopeGetFn,
  signal: AbortSignal | undefined
): Promise<GroupSiteFetch90dResult> {
  const maxPages = sharkscopeSiteMaxPages();
  const pag = await paginatePlayerGroupCompletedTournaments({
    groupName,
    filterBody: "Date:90D",
    fetchFn,
    signal,
    collectRows: true,
  });

  if (pag.pagesFetched === maxPages && pag.lastPageTournamentRows === 100) {
    log.warn(
      `completedTournaments Date:90D: atingido teto de ${maxPages} páginas (~${maxPages * 100} torneios) para o grupo "${groupName}". Pode haver mais torneios no período — aumente SHARKSCOPE_SITE_MAX_PAGES (custo: 1 busca por página).`
    );
  }

  if (pag.mergedSkippedUnknown.size > 0) {
    const parts = [...pag.mergedSkippedUnknown.entries()]
      .map(([net, n]) => `${net}:${n}`)
      .join(", ");
    log.warn(
      `Entradas ignoradas (rede não mapeada em sharkscopeNetworkToAppKey) — grupo "${groupName}": ${parts}`
    );
  }

  return {
    allRows: pag.rows,
    merged: pag.merged,
    mergedPlayer: pag.mergedPlayer,
    pagesFetched: pag.pagesFetched,
    tournamentRowsTotal: pag.tournamentRowsTotal,
  };
}

function buildPayload90d(groupName: string, fetch: GroupSiteFetch90dResult): GroupSiteBreakdownPayloadV3 {
  return {
    v: 3,
    groupName,
    filterBody: "Date:90D",
    pagesFetched: fetch.pagesFetched,
    tournamentRows: fetch.tournamentRowsTotal,
    byNetwork: Object.fromEntries(fetch.merged),
    byPlayerNick: mergedPlayerToRecord(fetch.mergedPlayer),
    tournaments: fetch.allRows,
  };
}

function buildPayload30dFromRows(
  groupName: string,
  rows30d: TournamentRow[],
  agg30: ReturnType<typeof aggregateRows>
): GroupSiteBreakdownPayloadV3 {
  return {
    v: 3,
    groupName,
    filterBody: "Date:30D",
    pagesFetched: 0,
    tournamentRows: rows30d.length,
    byNetwork: Object.fromEntries(agg30.byNetwork),
    byPlayerNick: mergedPlayerToRecord(agg30.byPlayer),
    tournaments: rows30d,
  };
}

/**
 * Busca `completedTournaments` UMA VEZ (90d) com TournamentRow[], depois grava:
 *  - `group_site_breakdown_90d` (v3 com tournaments[])
 *  - `group_site_breakdown_30d` (v3 filtrado localmente — custo API: 0)
 */
export async function syncGroupSiteBreakdownForGroup(
  playerNickId: string,
  groupName: string,
  forceRefresh: boolean,
  fetchFn: SharkScopeGetFn = sharkScopeGet,
  signal?: AbortSignal
): Promise<TournamentRow[]> {
  const fetch90 = await fetch90dCompletedTournamentPages(groupName, fetchFn, signal);

  const payload90 = buildPayload90d(groupName, fetch90);

  await getOrFetchSharkScope(
    playerNickId,
    SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D,
    SHARKSCOPE_GROUP_SITE_FILTER_KEYS["90d"],
    async () => payload90,
    24,
    forceRefresh
  );

  const cutoff30d = daysAgoTimestamp(30);
  const rows30d = filterTournamentRows(fetch90.allRows, { afterTimestamp: cutoff30d });
  const agg30 = aggregateRows(rows30d);

  const payload30 = buildPayload30dFromRows(groupName, rows30d, agg30);

  await upsertGroupSiteBreakdown30dCache(playerNickId, payload30);

  return fetch90.allRows;
}
