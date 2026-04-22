// lib/sharkscope/sync-player-nicks-from-groups.ts
import { prisma } from "@/lib/prisma";
import { sharkScopeAppKey, sharkScopeAppName } from "@/lib/constants/env";
import { sharkScopeGet } from "@/lib/utils/sharkscope-client";
import { parseGroupSiteBreakdownPayload } from "@/lib/sharkscope/completed-tournaments-aggregate";
import type { GroupSiteBreakdownPayload, NetworkAggBucket } from "@/lib/types/sharkscope/completed-tournaments";
import type { NickUpsertPlan, PlayerLite } from "@/lib/types/sharkscope/group-sync";
import { SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D, sharkscopeSiteMaxPages } from "@/lib/constants/sharkscope/group-site";
import { SHARKSCOPE_STATS_FILTER_30D } from "@/lib/constants/sharkscope/type-filters";
import { createLogger } from "@/lib/logger";
import {
  paginatePlayerGroupCompletedTournaments,
  toGroupSiteBreakdownPayloadV2,
} from "@/lib/sharkscope/group-site/group-site-live-fetch";

const log = createLogger("sharkscope.sync-nicks");

export type { NickUpsertPlan, PlayerLite };
export { assignSharkKeysToPlayers, pickBestSharkKeyByVolume, scorePlayerForSharkKey } from "../shark-key-scoring";

async function loadBreakdownFromCache(groupName: string): Promise<GroupSiteBreakdownPayload | null> {
  const nick = await prisma.playerNick.findFirst({
    where: { network: "PlayerGroup", nick: groupName },
    select: { id: true },
  });
  if (!nick) return null;

  const row = await prisma.sharkScopeCache.findUnique({
    where: {
      playerNickId_dataType_filterKey: {
        playerNickId: nick.id,
        dataType: SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
        filterKey: SHARKSCOPE_STATS_FILTER_30D,
      },
    },
    select: { rawData: true },
  });
  return row?.rawData ? parseGroupSiteBreakdownPayload(row.rawData) : null;
}

/** Mesma paginação do cron `syncGroupSiteBreakdownForGroup` (30D). */
export async function fetchGroupSiteBreakdown30dLive(groupName: string): Promise<GroupSiteBreakdownPayload> {
  const maxPages = sharkscopeSiteMaxPages();
  const filterBody = "Date:30D";

  const pag = await paginatePlayerGroupCompletedTournaments({
    groupName,
    filterBody,
    fetchFn: sharkScopeGet,
    collectRows: false,
  });

  if (pag.pagesFetched === maxPages && pag.lastPageTournamentRows === 100) {
    log.warn(
      `completedTournaments ${filterBody}: atingido teto de ${maxPages} páginas para o grupo "${groupName}". Aumente SHARKSCOPE_SITE_MAX_PAGES se precisar de mais torneios.`
    );
  }

  return toGroupSiteBreakdownPayloadV2(
    groupName,
    filterBody,
    pag.pagesFetched,
    pag.tournamentRowsTotal,
    pag.merged,
    pag.mergedPlayer
  );
}

export async function getOrFetchGroupBreakdown30d(
  groupName: string,
  preferLive: boolean
): Promise<GroupSiteBreakdownPayload | null> {
  if (!preferLive) {
    const cached = await loadBreakdownFromCache(groupName);
    if (cached?.byPlayerNick && Object.keys(cached.byPlayerNick).length > 0) return cached;
  }
  if (sharkScopeAppName && sharkScopeAppKey) {
    try {
      return await fetchGroupSiteBreakdown30dLive(groupName);
    } catch (e) {
      console.error(`[sync-nicks] Falha live para grupo "${groupName}":`, e);
    }
  }
  return loadBreakdownFromCache(groupName);
}

export function buildNickUpsertPlans(
  players: PlayerLite[],
  assignments: Map<string, string>,
  byPlayerNick: Record<string, Record<string, NetworkAggBucket>>
): NickUpsertPlan[] {
  const plans: NickUpsertPlan[] = [];
  const seen = new Set<string>();

  for (const [playerId, sharkKey] of assignments) {
    const perNet = byPlayerNick[sharkKey];
    const player = players.find((p) => p.id === playerId);
    if (!perNet || !player) continue;

    for (const [appKey, bucket] of Object.entries(perNet)) {
      if (!bucket || bucket.entries <= 0) continue;
      const dedupe = `${playerId}::${appKey}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      plans.push({ playerId, playerName: player.name, sharkKey, network: appKey, nick: sharkKey });
    }
  }
  return plans;
}
