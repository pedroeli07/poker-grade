import { getOrFetchSharkScope } from "@/lib/sharkscope-cache";
import { POKER_NETWORKS, sharkscopeApiNetworkSegment } from "@/lib/constants/poker-networks";
import { SHARKSCOPE_PLAYER_GROUP_STATS_IDS, sharkscopeSyncSiteNicksEnabled } from "@/lib/constants/sharkscope/group-site";
import { SHARKSCOPE_STATS_FILTER_90D } from "@/lib/constants/sharkscope/type-filters";
import { ErrorTypes } from "@/lib/types/primitives";
import type { SharkScopeSyncMode } from "@/lib/types/sharkScopeTypes";
import type { NickSiteStatisticsSyncOptions } from "@/lib/types/sharkscope/daily-sync";
import { createLogger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { isAbortError, throwIfAborted } from "@/lib/sharkscope/daily-sync/sync-abort";

const log = createLogger("cron.daily-sync.nick-site");

type SiteNickRow = { id: string; nick: string; network: string };

function resolveNickSiteSyncDecision(
  syncMode: SharkScopeSyncMode,
  onlyPlayerGroup: string | undefined
): { skip: boolean; run: boolean } {
  const skip = Boolean(onlyPlayerGroup?.trim()) && syncMode !== "analytics_nick";
  const run = !skip && (sharkscopeSyncSiteNicksEnabled() || syncMode === "analytics_nick");
  return { skip, run };
}

function logNickSiteSyncIntent(
  syncMode: SharkScopeSyncMode,
  skip: boolean,
  run: boolean,
  nickCount: number
) {
  if (skip) {
    log.info("SharkScope: sync por nick×rede omitido (sync de grupo único em modo analytics).");
  } else if (run) {
    log.info(`SharkScope: statistics por nick×rede (${nickCount} nicks) — modo ${syncMode}.`);
  } else {
    log.info("SharkScope: sync por nick×rede desativado (use analytics_nick, ou SHARKSCOPE_SYNC_SITE_NICKS=1).");
  }
}

async function loadActiveSiteNicks(nickSyncPlayerIds: string[] | null): Promise<SiteNickRow[]> {
  const siteNetworks = Object.keys(POKER_NETWORKS);
  return prisma.playerNick.findMany({
    where: {
      isActive: true,
      network: { in: siteNetworks },
      ...(nickSyncPlayerIds?.length ? { playerId: { in: nickSyncPlayerIds } } : {}),
    },
    select: { id: true, nick: true, network: true },
  });
}

async function fetchNickSite30And90(
  pn: SiteNickRow,
  opts: Pick<NickSiteStatisticsSyncOptions, "countedSharkScopeGet" | "trackRemaining" | "forceRefresh">
) {
  const { countedSharkScopeGet, trackRemaining, forceRefresh } = opts;
  const enc = encodeURIComponent(pn.nick);
  const apiNet = sharkscopeApiNetworkSegment(pn.network);
  const [rawSite30, rawSite90] = await Promise.all([
    getOrFetchSharkScope(
      pn.id,
      "stats_30d",
      "?filter=Date:30D",
      () =>
        countedSharkScopeGet(
          `/networks/${apiNet}/players/${enc}/statistics/${SHARKSCOPE_PLAYER_GROUP_STATS_IDS}?filter=${encodeURIComponent("Date:30D")}`
        ),
      24,
      forceRefresh
    ),
    getOrFetchSharkScope(
      pn.id,
      "stats_90d",
      SHARKSCOPE_STATS_FILTER_90D,
      () =>
        countedSharkScopeGet(
          `/networks/${apiNet}/players/${enc}/statistics/${SHARKSCOPE_PLAYER_GROUP_STATS_IDS}?filter=${encodeURIComponent("Date:90D")}`
        ),
      24,
      forceRefresh
    ),
  ]);
  trackRemaining(rawSite30);
  trackRemaining(rawSite90);
}

export async function runNickSiteStatisticsSync(opts: NickSiteStatisticsSyncOptions): Promise<void> {
  const { syncMode, onlyPlayerGroup, nickSyncPlayerIds, signal, countedSharkScopeGet, trackRemaining, forceRefresh } =
    opts;

  const siteNicks = await loadActiveSiteNicks(nickSyncPlayerIds);
  const { skip, run } = resolveNickSiteSyncDecision(syncMode, onlyPlayerGroup);
  logNickSiteSyncIntent(syncMode, skip, run, siteNicks.length);

  if (!run) return;

  for (const pn of siteNicks) {
    throwIfAborted(signal);
    try {
      await fetchNickSite30And90(pn, { countedSharkScopeGet, trackRemaining, forceRefresh });
    } catch (err) {
      if (isAbortError(err)) throw err;
      log.warn(
        `[nick-rede] ${pn.network}/${pn.nick}`,
        err instanceof Error ? { message: err.message } : { message: ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR }
      );
    }
  }
}
