import { sharkScopeGet } from "@/lib/utils";
import { getOrFetchSharkScope } from "@/lib/sharkscope-cache";
import {
  aggregateCompletedTournamentsFull,
  mergeNetworkAggMaps,
  mergePlayerNetworkMaps,
  type GroupSiteBreakdownPayload,
  type NetworkAggBucket,
} from "@/lib/sharkscope/completed-tournaments-aggregate";
import {
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D,
  SHARKSCOPE_GROUP_SITE_FILTER_KEYS,
  sharkscopeSiteMaxPages,
} from "@/lib/constants/sharkscope-group-site";

/**
 * Busca `completedTournaments` do Player Group (paginado), agrega lucro/stake por rede e grava em cache.
 * Várias chamadas GET podem ocorrer dentro de um único `getOrFetch` (uma escrita de cache).
 */
export async function syncGroupSiteBreakdownForGroup(
  playerNickId: string,
  groupName: string,
  forceRefresh: boolean
): Promise<void> {
  const maxPages = sharkscopeSiteMaxPages();
  const periods = [
    {
      filterBody: "Date:30D",
      filterKey: SHARKSCOPE_GROUP_SITE_FILTER_KEYS["30d"],
      dataType: SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
    },
    {
      filterBody: "Date:90D",
      filterKey: SHARKSCOPE_GROUP_SITE_FILTER_KEYS["90d"],
      dataType: SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D,
    },
  ] as const;

  for (const p of periods) {
    await getOrFetchSharkScope(
      playerNickId,
      p.dataType,
      p.filterKey,
      async () => {
        let merged = new Map<string, NetworkAggBucket>();
        let mergedPlayer = new Map<string, Map<string, NetworkAggBucket>>();
        let pagesFetched = 0;
        let tournamentRowsTotal = 0;

        for (let page = 0; page < maxPages; page++) {
          const start = page * 100 + 1;
          const end = start + 99;
          const path = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/completedTournaments?order=Last,${start}~${end}&filter=${encodeURIComponent(p.filterBody)}`;
          const raw = await sharkScopeGet(path);
          const { byNetwork, byPlayer, tournamentRows } = aggregateCompletedTournamentsFull(raw);
          merged = mergeNetworkAggMaps(merged, byNetwork);
          mergePlayerNetworkMaps(mergedPlayer, byPlayer);
          tournamentRowsTotal += tournamentRows;
          pagesFetched++;
          if (tournamentRows === 0) break;
          if (tournamentRows < 100) break;
        }

        const byPlayerNick: Record<string, Record<string, NetworkAggBucket>> = {};
        for (const [pk, inner] of mergedPlayer) {
          byPlayerNick[pk] = Object.fromEntries(inner);
        }

        const payload: GroupSiteBreakdownPayload = {
          v: 2,
          groupName,
          filterBody: p.filterBody,
          pagesFetched,
          tournamentRows: tournamentRowsTotal,
          byNetwork: Object.fromEntries(merged),
          byPlayerNick,
        };
        return payload;
      },
      24,
      forceRefresh
    );
  }
}
