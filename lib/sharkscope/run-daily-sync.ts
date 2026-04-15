import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isSharkScopePlayerGroupUnavailableMessage, sharkScopeGet } from "@/lib/utils";
import { getOrFetchSharkScope, replicateSharkScopeCachesToPlayerNick } from "@/lib/sharkscope-cache";
import {
  syncGroupSiteBreakdownForGroup,
  type SharkScopeGetFn,
} from "@/lib/sharkscope/group-site-breakdown-sync";
import {
  computeStatsFromRows,
  filterTournamentRows,
  type TournamentRow,
} from "@/lib/sharkscope/completed-tournaments-aggregate";
import {
  playerGroupStatisticsPath,
  SHARKSCOPE_PLAYER_GROUP_STATS_IDS,
  sharkscopeSyncSiteNicksEnabled,
} from "@/lib/constants/sharkscope-group-site";
import {
  extractStat,
  extractRemainingSearches,
  roiSeverity,
  reentrySeverity,
  earlyFinishSeverity,
  lateFinishSeverity,
} from "@/lib/sharkscope-parse";
import { createLogger } from "@/lib/logger";
import { POKER_NETWORKS, sharkScopeAppName, sharkScopeAppKey, sharkscopeApiNetworkSegment } from "@/lib/constants";
import {
  SHARKSCOPE_STATS_FILTER_10D,
  SHARKSCOPE_STATS_FILTER_30D,
  SHARKSCOPE_STATS_FILTER_90D,
} from "@/lib/constants/sharkscope-type-filters";
import { ErrorTypes } from "@/lib/types";
import type { SharkScopeSyncMode } from "@/lib/types/sharkScopeTypes";

const log = createLogger("cron.daily-sync");

export type DailySyncSharkScopeResult = {
  processed: number;
  errors: number;
  sharkHttpCalls: number;
  remainingSearches: number | null;
  ts: string;
  cancelled?: boolean;
  syncMode?: SharkScopeSyncMode;
};

export type RunDailySyncOptions = {
  signal?: AbortSignal;
  /**
   * Sincroniza só este `playerGroup`. Com `syncMode: "analytics"`, pula stats por nick×rede.
   * Com `analytics_nick`, mantém statistics do grupo + nick×rede **só** para jogadores deste grupo.
   */
  onlyPlayerGroup?: string;
  /**
   * `players` — só `Date:10D` (o que a tabela de jogadores lê); sem 30d/90d ou CT.
   * `analytics` — 30d/90d + CT + breakdown; **não** refaz `Date:10D` (evita duplicar o botão de jogadores). Não pede `statistics` lifetime (poupa buscas).
   * `analytics_nick` — 30d/90d por Player Group + `statistics` por nick×rede; **sem** `completedTournaments` (poupa buscas vs `analytics`).
   * `light` — 10d/30d/90d, sem CT. Não pede lifetime.
   * `full` — 10d/30d/90d + CT + breakdown por tipo. Não pede lifetime.
   */
  syncMode?: SharkScopeSyncMode;
};

function shouldFetchStats10d(mode: SharkScopeSyncMode): boolean {
  return mode === "players" || mode === "light" || mode === "full";
}

function shouldFetchStats30d90(mode: SharkScopeSyncMode): boolean {
  return mode === "analytics" || mode === "analytics_nick" || mode === "light" || mode === "full";
}

function shouldFetchCT(mode: SharkScopeSyncMode): boolean {
  return mode === "analytics" || mode === "full";
}

function isAbortError(e: unknown): boolean {
  return (
    (typeof DOMException !== "undefined" && e instanceof DOMException && e.name === "AbortError") ||
    (e instanceof Error && e.name === "AbortError")
  );
}

function throwIfAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) {
    throw new DOMException("Sincronização cancelada", "AbortError");
  }
}

function daysAgoTimestamp(days: number): number {
  return Math.floor(Date.now() / 1000) - days * 86400;
}

/**
 * Núcleo do sync SharkScope (cron e botão manual).
 *
 * Por grupo: **não** pedimos `statistics` lifetime (custo de buscas); períodos 10d/30d/90d e CT dependem de `syncMode`.
 * Modos com CT: `analytics` e `full` — `completedTournaments` (90d) paginado para `group_site_breakdown_*` e cortes por tipo.
 * `analytics_nick` não usa CT; aba Por site usa caches `statistics` por nick×rede (ver `SHARKSCOPE_ANALYTICS_SITE_BY_NICK`).
 * Alerta `high_variance`: `AvEntrants` de **Date:30D** (não lifetime).
 *
 * Validação operacional: após sync full, comparar TotalROI / FP / FT com a pesquisa avançada no site (mesmo `Date:10D`).
 */
export async function runDailySyncSharkScope(
  forceRefresh: boolean,
  options?: RunDailySyncOptions
): Promise<DailySyncSharkScopeResult> {
  if (!sharkScopeAppName || !sharkScopeAppKey) {
    throw new Error(ErrorTypes.SHARK_SYNC_CREDENTIALS_NOT_CONFIGURED);
  }

  const signal = options?.signal;
  const syncMode: SharkScopeSyncMode = options?.syncMode ?? "full";

  log.info("Iniciando daily-sync SharkScope", { forceRefresh, syncMode });

  let sharkHttpCalls = 0;
  const countedSharkScopeGet: SharkScopeGetFn = (path, init?) => {
    sharkHttpCalls++;
    return sharkScopeGet(path, { ...init, signal: init?.signal ?? signal });
  };

  const players = await prisma.player.findMany({
    where: { status: "ACTIVE", playerGroup: { not: null } },
    select: { id: true, name: true, playerGroup: true },
  });

  log.info(`Processando ${players.length} jogadores ativos (playerGroup), agrupados por nome de grupo`);

  const byGroupAll = new Map<string, typeof players>();
  for (const p of players) {
    const g = p.playerGroup!;
    if (!byGroupAll.has(g)) byGroupAll.set(g, []);
    byGroupAll.get(g)!.push(p);
  }

  let byGroup = byGroupAll;
  if (options?.onlyPlayerGroup?.trim()) {
    const want = options.onlyPlayerGroup.trim();
    const one = byGroupAll.get(want);
    byGroup = new Map();
    if (one?.length) {
      byGroup.set(want, one);
      if (syncMode === "analytics_nick") {
        log.info(
          `Modo grupo único (analytics_nick): "${want}" (${one.length} jogador(es)); statistics por nick×rede só para este(s) jogador(es).`
        );
      } else {
        log.info(`Modo grupo único: "${want}" (${one.length} jogador(es)); sync por nick×rede desligado.`);
      }
    } else {
      log.warn(`Nenhum jogador ativo com playerGroup exatamente "${want}".`);
    }
  }

  let remainingSearches: number | null = null;
  let processed = 0;
  let errors = 0;

  try {
  for (const [groupName, members] of byGroup) {
    throwIfAborted(signal);
    const primaryPlayer = members[0]!;

    try {
      const upsertGroupNick = async (playerId: string) =>
        prisma.playerNick.upsert({
          where: {
            playerId_nick_network: {
              playerId,
              nick: groupName,
              network: "PlayerGroup",
            },
          },
          update: {},
          create: {
            playerId,
            nick: groupName,
            network: "PlayerGroup",
            isActive: true,
          },
        });

      const primaryNick = await upsertGroupNick(primaryPlayer.id);

      const need10 = shouldFetchStats10d(syncMode);
      const need3090 = shouldFetchStats30d90(syncMode);
      const needCT = shouldFetchCT(syncMode);

      let rawStats10d: unknown | undefined;
      let rawStats30d: unknown | undefined;
      let rawStats90d: unknown | undefined;

      if (need10) {
        rawStats10d = await getOrFetchSharkScope(
          primaryNick.id,
          "stats_10d",
          SHARKSCOPE_STATS_FILTER_10D,
          () => countedSharkScopeGet(playerGroupStatisticsPath(groupName, "Date:10D")),
          24,
          forceRefresh
        );
        const rem10 = extractRemainingSearches(rawStats10d);
        if (rem10 !== null) remainingSearches = rem10;
      }

      if (need3090) {
        rawStats30d = await getOrFetchSharkScope(
          primaryNick.id,
          "stats_30d",
          SHARKSCOPE_STATS_FILTER_30D,
          () => countedSharkScopeGet(playerGroupStatisticsPath(groupName, "Date:30D")),
          24,
          forceRefresh
        );
        const rem30 = extractRemainingSearches(rawStats30d);
        if (rem30 !== null) remainingSearches = rem30;

        rawStats90d = await getOrFetchSharkScope(
          primaryNick.id,
          "stats_90d",
          SHARKSCOPE_STATS_FILTER_90D,
          () => countedSharkScopeGet(playerGroupStatisticsPath(groupName, "Date:90D")),
          24,
          forceRefresh
        );
        const rem90 = extractRemainingSearches(rawStats90d);
        if (rem90 !== null) remainingSearches = rem90;
      }

      let allRows: TournamentRow[] = [];
      if (needCT) {
        allRows = await syncGroupSiteBreakdownForGroup(
          primaryNick.id,
          groupName,
          forceRefresh,
          countedSharkScopeGet,
          signal
        );
        if (syncMode === "analytics") {
          log.info(
            `[${groupName}] modo analytics: CT + stats 30d/90d; 10d não atualizado neste run (use o botão em Jogadores).`
          );
        }
      } else if (syncMode === "light") {
        log.info(
          `[${groupName}] sync leve: statistics 10d/30d/90d sem completedTournaments — breakdown por rede só em modo com CT.`
        );
      } else if (syncMode === "players") {
        log.info(`[${groupName}] modo players: só Date:10D (tabela); sem lifetime/30d/90d/CT.`);
      } else if (syncMode === "analytics_nick") {
        log.info(
          `[${groupName}] modo analytics_nick: statistics 30d/90d (grupo + nick×rede); sem CT — ranking/tipo dependem de sync anterior ou modo full/analytics.`
        );
      }

      if (needCT && allRows.length > 0) {
        const cutoff30d = daysAgoTimestamp(30);
        const rows30d = filterTournamentRows(allRows, { afterTimestamp: cutoff30d });
        const bountyRows30 = filterTournamentRows(rows30d, { tournamentType: "bounty" });
        const satRows30 = filterTournamentRows(rows30d, { tournamentType: "satellite" });
        const vanillaRows30 = filterTournamentRows(rows30d, { tournamentType: "vanilla" });

        await saveComputedStats(primaryNick.id, "stats_30d", `?filter=${encodeURIComponent("Date:30D;Type:B")}`, computeStatsFromRows(bountyRows30), forceRefresh);
        await saveComputedStats(primaryNick.id, "stats_30d", `?filter=${encodeURIComponent("Date:30D;Type:SAT")}`, computeStatsFromRows(satRows30), forceRefresh);
        await saveComputedStats(primaryNick.id, "stats_30d", `?filter=${encodeURIComponent("Date:30D;Type!:B;Type!:SAT")}`, computeStatsFromRows(vanillaRows30), forceRefresh);

        const bountyRows90 = filterTournamentRows(allRows, { tournamentType: "bounty" });
        const satRows90 = filterTournamentRows(allRows, { tournamentType: "satellite" });
        const vanillaRows90 = filterTournamentRows(allRows, { tournamentType: "vanilla" });

        await saveComputedStats(primaryNick.id, "stats_90d", `?filter=${encodeURIComponent("Date:90D;Type:B")}`, computeStatsFromRows(bountyRows90), forceRefresh);
        await saveComputedStats(primaryNick.id, "stats_90d", `?filter=${encodeURIComponent("Date:90D;Type:SAT")}`, computeStatsFromRows(satRows90), forceRefresh);
        await saveComputedStats(primaryNick.id, "stats_90d", `?filter=${encodeURIComponent("Date:90D;Type!:B;Type!:SAT")}`, computeStatsFromRows(vanillaRows90), forceRefresh);
      }

      // Replicar caches para membros do grupo
      for (const member of members.slice(1)) {
        const memberNick = await upsertGroupNick(member.id);
        await replicateSharkScopeCachesToPlayerNick(primaryNick.id, memberNick.id);
      }

      const avgEntrants30d =
        rawStats30d != null ? extractStat(rawStats30d, "AvEntrants") : null;
      const roi10d = extractStat(rawStats10d, "TotalROI");
      const earlyFinish10d = extractStat(rawStats10d, "EarlyFinish");
      const lateFinish10d = extractStat(rawStats10d, "LateFinish");
      const count30d = extractStat(rawStats30d, "Count");
      const entrants30d = extractStat(rawStats30d, "Entries");

      for (const player of members) {
        if (roi10d !== null) {
          const sev = roiSeverity(roi10d);
          if (sev === "red" || sev === "yellow") {
            await prisma.alertLog.create({
              data: {
                playerId: player.id,
                alertType: "roi_drop",
                severity: sev,
                metricValue: roi10d,
                threshold: sev === "red" ? -40 : -20,
                context: { groupName, period: "10d" },
              },
            });
          }
        }

        if (avgEntrants30d !== null && avgEntrants30d > 1200) {
          await prisma.alertLog.create({
            data: {
              playerId: player.id,
              alertType: "high_variance",
              severity: "yellow",
              metricValue: avgEntrants30d,
              threshold: 1200,
              context: { groupName, period: "30d" },
            },
          });
        }

        if (count30d != null && count30d > 0 && entrants30d != null && entrants30d > count30d) {
          const reentryRate = (entrants30d / count30d - 1) * 100;
          const sev = reentrySeverity(reentryRate);
          if (sev === "red" || sev === "yellow") {
            await prisma.alertLog.create({
              data: {
                playerId: player.id,
                alertType: "reentry_high",
                severity: sev,
                metricValue: reentryRate,
                threshold: 25,
                context: { groupName, period: "30d", count: count30d, entrants: entrants30d },
              },
            });
          }
        }

        if (earlyFinish10d !== null) {
          const sev = earlyFinishSeverity(earlyFinish10d);
          if (sev === "red" || sev === "yellow") {
            await prisma.alertLog.create({
              data: {
                playerId: player.id,
                alertType: "early_finish",
                severity: sev,
                metricValue: earlyFinish10d,
                threshold: 8,
                context: { groupName, period: "10d" },
              },
            });
          }
        }

        if (lateFinish10d !== null) {
          const sev = lateFinishSeverity(lateFinish10d);
          if (sev === "red" || sev === "yellow") {
            await prisma.alertLog.create({
              data: {
                playerId: player.id,
                alertType: "late_finish",
                severity: sev,
                metricValue: lateFinish10d,
                threshold: 8,
                context: { groupName, period: "10d" },
              },
            });
          }
        }

        await prisma.alertLog.deleteMany({
          where: { playerId: player.id, alertType: "group_not_found" },
        });
      }

      if (roi10d !== null) {
        const sevRoi = roiSeverity(roi10d);
        if (sevRoi === "red" || sevRoi === "yellow") {
          log.warn(`🚨 [${groupName}] Alerta ROI (10d): ${roi10d.toFixed(1)}% (${sevRoi})`);
        }
      }
      if (earlyFinish10d !== null) {
        const sevFp = earlyFinishSeverity(earlyFinish10d);
        if (sevFp === "red" || sevFp === "yellow") {
          log.warn(`⚠️ [${groupName}] Alerta FP (10d): ${earlyFinish10d.toFixed(1)}% (${sevFp})`);
        }
      }
      if (lateFinish10d !== null) {
        const sevFt = lateFinishSeverity(lateFinish10d);
        if (sevFt === "red" || sevFt === "yellow") {
          log.warn(`⚠️ [${groupName}] Alerta FT (10d): ${lateFinish10d.toFixed(1)}% (${sevFt})`);
        }
      }

      log.info(
        `✅ [${groupName}] Sincronizado (${members.length} jogador(es), modo=${syncMode}, ${needCT ? `${allRows.length} torneios 90d (CT)` : "sem CT"}) | ROI(10d): ${roi10d != null ? roi10d.toFixed(1) : "-"} | FP(10d): ${earlyFinish10d != null ? earlyFinish10d.toFixed(1) : "-"} | FT(10d): ${lateFinish10d != null ? lateFinish10d.toFixed(1) : "-"}`
      );

      processed += members.length;
    } catch (err) {
      if (isAbortError(err)) throw err;
      errors++;
      const errMsg = err instanceof Error ? err.message : String(err);
      const isGroupUnavailable = isSharkScopePlayerGroupUnavailableMessage(errMsg);

      if (isGroupUnavailable) {
        for (const player of members) {
          await prisma.alertLog.deleteMany({
            where: { playerId: player.id, alertType: "group_not_found" },
          });
          await prisma.alertLog.create({
            data: {
              playerId: player.id,
              alertType: "group_not_found",
              severity: "red",
              metricValue: 0,
              threshold: 0,
              context: { groupName, message: ErrorTypes.SHARK_GROUP_NOT_FOUND },
            },
          });
        }
        log.warn(`SharkScope: grupo não encontrado ou indisponível — "${groupName}"`, {
          sharkscope: errMsg,
        });
      } else {
        log.error(
          `Erro ao processar grupo ${groupName}`,
          err instanceof Error ? err : undefined,
          { groupName }
        );
      }
    }
  }

  const siteNetworks = Object.keys(POKER_NETWORKS);
  const nickSyncPlayerIds =
    syncMode === "analytics_nick" && options?.onlyPlayerGroup?.trim()
      ? [...byGroup.values()].flat().map((p) => p.id)
      : null;

  const siteNicks = await prisma.playerNick.findMany({
    where: {
      isActive: true,
      network: { in: siteNetworks },
      ...(nickSyncPlayerIds && nickSyncPlayerIds.length > 0 ? { playerId: { in: nickSyncPlayerIds } } : {}),
    },
    select: { id: true, nick: true, network: true },
  });

  const skipSiteNickStats = Boolean(options?.onlyPlayerGroup?.trim()) && syncMode !== "analytics_nick";
  const shouldRunNickSiteSync =
    !skipSiteNickStats && (sharkscopeSyncSiteNicksEnabled() || syncMode === "analytics_nick");

  if (skipSiteNickStats) {
    log.info("SharkScope: sync por nick×rede omitido (sync de grupo único em modo analytics).");
  } else if (shouldRunNickSiteSync && syncMode === "analytics_nick") {
    log.info(`SharkScope: statistics por nick×rede (${siteNicks.length} nicks) — modo analytics_nick (sem CT).`);
  } else if (shouldRunNickSiteSync && sharkscopeSyncSiteNicksEnabled()) {
    log.info(`SharkScope: sincronizando ${siteNicks.length} nicks por rede (SHARKSCOPE_SYNC_SITE_NICKS)`);
  } else {
    log.info(
      "SharkScope: sync por nick×rede desativado (use analytics_nick, ou SHARKSCOPE_SYNC_SITE_NICKS=1). Por site pode vir de group_site_breakdown_* ou caches por nick."
    );
  }

  if (shouldRunNickSiteSync) {
    for (const pn of siteNicks) {
      throwIfAborted(signal);
      try {
        const enc = encodeURIComponent(pn.nick);
        const apiNet = sharkscopeApiNetworkSegment(pn.network);
        const pathSite30 = `/networks/${apiNet}/players/${enc}/statistics/${SHARKSCOPE_PLAYER_GROUP_STATS_IDS}?filter=${encodeURIComponent("Date:30D")}`;
        const pathSite90 = `/networks/${apiNet}/players/${enc}/statistics/${SHARKSCOPE_PLAYER_GROUP_STATS_IDS}?filter=${encodeURIComponent("Date:90D")}`;
        const [rawSite30, rawSite90] = await Promise.all([
          getOrFetchSharkScope(
            pn.id,
            "stats_30d",
            "?filter=Date:30D",
            () => countedSharkScopeGet(pathSite30),
            24,
            forceRefresh
          ),
          getOrFetchSharkScope(
            pn.id,
            "stats_90d",
            SHARKSCOPE_STATS_FILTER_90D,
            () => countedSharkScopeGet(pathSite90),
            24,
            forceRefresh
          ),
        ]);
        const remS30 = extractRemainingSearches(rawSite30);
        if (remS30 !== null) remainingSearches = remS30;
        const remS90 = extractRemainingSearches(rawSite90);
        if (remS90 !== null) remainingSearches = remS90;
      } catch (err) {
        if (isAbortError(err)) throw err;
        log.warn(
          `[nick-rede] ${pn.network}/${pn.nick}`,
          err instanceof Error ? { message: err.message } : { message: ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR }
        );
      }
    }
  }

  log.info(
    "daily-sync concluído",
    {
      sharkHttpCalls,
      remainingSearches,
      processed,
      errors,
    }
  );

  try {
    revalidateTag("sharkscope-analytics", "max");
  } catch {
    /* ignore */
  }

  return {
    processed,
    errors,
    sharkHttpCalls,
    remainingSearches,
    ts: new Date().toISOString(),
    syncMode,
  };
  } catch (e) {
    if (isAbortError(e)) {
      log.info("daily-sync cancelado pelo cliente", { sharkHttpCalls, processed, errors });
      try {
        revalidateTag("sharkscope-analytics", "max");
      } catch {
        /* ignore */
      }
      return {
        processed,
        errors,
        sharkHttpCalls,
        remainingSearches,
        ts: new Date().toISOString(),
        cancelled: true,
        syncMode,
      };
    }
    throw e;
  }
}

type ComputedStats = ReturnType<typeof computeStatsFromRows>;

async function saveComputedStats(
  playerNickId: string,
  dataType: string,
  filterKey: string,
  stats: ComputedStats,
  forceRefresh: boolean,
  extraStats?: Record<string, number | null>
) {
  const fakeResponse = buildFakeStatsResponse(stats, extraStats);
  await getOrFetchSharkScope(
    playerNickId,
    dataType,
    filterKey,
    async () => fakeResponse,
    24,
    forceRefresh
  );
}

function buildFakeStatsResponse(
  stats: ComputedStats,
  extra?: Record<string, number | null>
): unknown {
  const statistics: Record<string, unknown>[] = [];

  const push = (id: string, value: number | null) => {
    if (value !== null) statistics.push({ "@id": id, "#text": String(value) });
  };

  push("Count", stats.count);
  push("Entries", stats.entries);
  push("TotalROI", stats.totalRoi);
  push("AvROI", stats.totalRoi);
  push("ITM", stats.itm);
  push("TotalProfit", stats.totalProfit);
  push("Profit", stats.totalProfit);
  push("TotalStake", stats.totalStake);
  push("AvStake", stats.avStake);
  push("FinshesEarly", stats.earlyFinish);
  push("FinshesLate", stats.lateFinish);
  push("Entrants", stats.entries);

  if (extra) {
    for (const [id, val] of Object.entries(extra)) {
      push(id, val);
    }
  }

  return {
    Response: {
      PlayerResponse: {
        PlayerView: {
          PlayerGroup: {
            Statistics: {
              Statistic: statistics,
            },
          },
        },
      },
      UserInfo: {},
    },
  };
}
