import { sharkScopeGet } from "@/lib/utils";
import { getOrFetchSharkScope } from "@/lib/sharkscope-cache";
import {
  aggregateCompletedTournamentsFull,
  aggregateRows,
  filterTournamentRows,
  mergeNetworkAggMaps,
  mergePlayerNetworkMaps,
  type GroupSiteBreakdownPayloadV3,
  type NetworkAggBucket,
  type TournamentRow,
} from "@/lib/sharkscope/completed-tournaments-aggregate";
import {
  SHARKSCOPE_COMPLETED_TOURNAMENTS_EXPAND_MULTI,
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D,
  SHARKSCOPE_GROUP_SITE_FILTER_KEYS,
  sharkscopeSiteMaxPages,
} from "@/lib/constants/sharkscope-group-site";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { createLogger } from "@/lib/logger";

const log = createLogger("sharkscope.group-site-breakdown");

export type SharkScopeGetFn = typeof sharkScopeGet;

function throwIfAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) {
    throw new DOMException("Sincronização cancelada", "AbortError");
  }
}

function daysAgoTimestamp(days: number): number {
  return Math.floor(Date.now() / 1000) - days * 86400;
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
  const maxPages = sharkscopeSiteMaxPages();

  const allRows: TournamentRow[] = [];
  let merged = new Map<string, NetworkAggBucket>();
  const mergedPlayer = new Map<string, Map<string, NetworkAggBucket>>();
  const mergedSkippedUnknown = new Map<string, number>();
  let pagesFetched = 0;
  let tournamentRowsTotal = 0;
  let lastPageTournamentRows = 0;

  for (let page = 0; page < maxPages; page++) {
    throwIfAborted(signal);
    const start = page * 100 + 1;
    const end = start + 99;
    const path = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/completedTournaments?order=Last,${start}~${end}&filter=${encodeURIComponent("Date:90D")}&${SHARKSCOPE_COMPLETED_TOURNAMENTS_EXPAND_MULTI}`;
    const raw = await fetchFn(path, { signal });
    const { byNetwork, byPlayer, tournamentRows, rows, skippedUnknownNetworks } =
      aggregateCompletedTournamentsFull(raw, true);
    for (const [net, n] of skippedUnknownNetworks) {
      mergedSkippedUnknown.set(net, (mergedSkippedUnknown.get(net) ?? 0) + n);
    }
    merged = mergeNetworkAggMaps(merged, byNetwork);
    mergePlayerNetworkMaps(mergedPlayer, byPlayer);
    allRows.push(...rows);
    tournamentRowsTotal += tournamentRows;
    pagesFetched++;
    lastPageTournamentRows = tournamentRows;
    if (tournamentRows === 0) break;
    if (tournamentRows < 100) break;
  }

  if (pagesFetched === maxPages && lastPageTournamentRows === 100) {
    log.warn(
      `completedTournaments Date:90D: atingido teto de ${maxPages} páginas (~${maxPages * 100} torneios) para o grupo "${groupName}". Pode haver mais torneios no período — aumente SHARKSCOPE_SITE_MAX_PAGES (custo: 1 busca por página).`
    );
  }

  if (mergedSkippedUnknown.size > 0) {
    const parts = [...mergedSkippedUnknown.entries()]
      .map(([net, n]) => `${net}:${n}`)
      .join(", ");
    log.warn(
      `Entradas ignoradas (rede não mapeada em sharkscopeNetworkToAppKey) — grupo "${groupName}": ${parts}`
    );
  }

  const byPlayerNick90: Record<string, Record<string, NetworkAggBucket>> = {};
  for (const [pk, inner] of mergedPlayer) {
    byPlayerNick90[pk] = Object.fromEntries(inner);
  }

  const payload90: GroupSiteBreakdownPayloadV3 = {
    v: 3,
    groupName,
    filterBody: "Date:90D",
    pagesFetched,
    tournamentRows: tournamentRowsTotal,
    byNetwork: Object.fromEntries(merged),
    byPlayerNick: byPlayerNick90,
    tournaments: allRows,
  };

  await getOrFetchSharkScope(
    playerNickId,
    SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D,
    SHARKSCOPE_GROUP_SITE_FILTER_KEYS["90d"],
    async () => payload90,
    24,
    forceRefresh
  );

  const cutoff30d = daysAgoTimestamp(30);
  const rows30d = filterTournamentRows(allRows, { afterTimestamp: cutoff30d });
  const agg30 = aggregateRows(rows30d);

  const byPlayerNick30: Record<string, Record<string, NetworkAggBucket>> = {};
  for (const [pk, inner] of agg30.byPlayer) {
    byPlayerNick30[pk] = Object.fromEntries(inner);
  }

  const payload30: GroupSiteBreakdownPayloadV3 = {
    v: 3,
    groupName,
    filterBody: "Date:30D",
    pagesFetched: 0,
    tournamentRows: rows30d.length,
    byNetwork: Object.fromEntries(agg30.byNetwork),
    byPlayerNick: byPlayerNick30,
    tournaments: rows30d,
  };

  const filterKey30 = SHARKSCOPE_GROUP_SITE_FILTER_KEYS["30d"];
  await prisma.sharkScopeCache.upsert({
    where: {
      playerNickId_dataType_filterKey: {
        playerNickId,
        dataType: SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
        filterKey: filterKey30,
      },
    },
    update: {
      rawData: payload30 as unknown as Prisma.InputJsonValue,
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 3600_000),
    },
    create: {
      playerNickId,
      dataType: SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
      filterKey: filterKey30,
      rawData: payload30 as unknown as Prisma.InputJsonValue,
      expiresAt: new Date(Date.now() + 24 * 3600_000),
    },
  });

  return allRows;
}
