import {
  aggregateCompletedTournamentsFull,
  mergeNetworkAggMaps,
  mergePlayerNetworkMaps,
} from "@/lib/sharkscope/completed-tournaments-aggregate";
import { mergeSkippedUnknownMaps } from "@/lib/sharkscope/group-site/group-site-breakdown-helpers";
import { throwIfAborted } from "@/lib/sharkscope/daily-sync/sync-abort";
import type {
  GroupSiteBreakdownPayload,
  NetworkAggBucket,
} from "@/lib/types/sharkscope/completed-tournaments";
import type {
  PlayerGroupCompletedTournamentsPaginateOpts,
  PlayerGroupCompletedTournamentsPaginateResult,
} from "@/lib/types/sharkscope/group-site";
import { SHARKSCOPE_COMPLETED_TOURNAMENTS_EXPAND_MULTI, sharkscopeSiteMaxPages } from "@/lib/constants/sharkscope/group-site";
import { mergedPlayerToRecord } from "@/lib/sharkscope/group-site/group-site-breakdown-helpers";

/**
 * Pagina `completedTournaments` de um Player Group (expand multi) — base comum a sync 90d/30d e ferramentas.
 */
export async function paginatePlayerGroupCompletedTournaments(
  opts: PlayerGroupCompletedTournamentsPaginateOpts
): Promise<PlayerGroupCompletedTournamentsPaginateResult> {
  const { groupName, filterBody, fetchFn, signal, collectRows } = opts;
  const maxPages = sharkscopeSiteMaxPages();

  let merged = new Map<string, NetworkAggBucket>();
  const mergedPlayer = new Map<string, Map<string, NetworkAggBucket>>();
  const mergedSkippedUnknown = new Map<string, number>();
  let pagesFetched = 0;
  let tournamentRowsTotal = 0;
  let lastPageTournamentRows = 0;
  const rows: PlayerGroupCompletedTournamentsPaginateResult["rows"] = [];

  for (let page = 0; page < maxPages; page++) {
    throwIfAborted(signal);
    const start = page * 100 + 1;
    const end = start + 99;
    const path = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/completedTournaments?order=Last,${start}~${end}&filter=${encodeURIComponent(filterBody)}&${SHARKSCOPE_COMPLETED_TOURNAMENTS_EXPAND_MULTI}`;
    const raw = await fetchFn(path, { signal });
    const agg = aggregateCompletedTournamentsFull(raw, collectRows);
    mergeSkippedUnknownMaps(mergedSkippedUnknown, agg.skippedUnknownNetworks);
    merged = mergeNetworkAggMaps(merged, agg.byNetwork);
    mergePlayerNetworkMaps(mergedPlayer, agg.byPlayer);
    if (collectRows) rows.push(...agg.rows);
    tournamentRowsTotal += agg.tournamentRows;
    lastPageTournamentRows = agg.tournamentRows;
    pagesFetched++;
    if (agg.tournamentRows === 0) break;
    if (agg.tournamentRows < 100) break;
  }

  return {
    merged,
    mergedPlayer,
    mergedSkippedUnknown,
    pagesFetched,
    tournamentRowsTotal,
    lastPageTournamentRows,
    rows,
  };
}

export function toGroupSiteBreakdownPayloadV2(
  groupName: string,
  filterBody: string,
  pagesFetched: number,
  tournamentRowsTotal: number,
  merged: Map<string, NetworkAggBucket>,
  mergedPlayer: Map<string, Map<string, NetworkAggBucket>>
): Omit<GroupSiteBreakdownPayload, "v"> & { v: 1 | 2 } {
  return {
    v: 2,
    groupName,
    filterBody,
    pagesFetched,
    tournamentRows: tournamentRowsTotal,
    byNetwork: Object.fromEntries(merged),
    byPlayerNick: mergedPlayerToRecord(mergedPlayer),
  };
}
