import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sharkScopeGet } from "@/lib/utils";
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
import { POKER_NETWORKS, sharkScopeAppName, sharkScopeAppKey } from "@/lib/constants";
import {
  SHARKSCOPE_STATS_FILTER_10D,
  SHARKSCOPE_STATS_FILTER_30D,
  SHARKSCOPE_STATS_FILTER_90D,
} from "@/lib/constants/sharkscope-type-filters";
import { ErrorTypes } from "@/lib/types";

const log = createLogger("cron.daily-sync");

export type DailySyncSharkScopeResult = {
  processed: number;
  errors: number;
  sharkHttpCalls: number;
  remainingSearches: number | null;
  ts: string;
  cancelled?: boolean;
  syncMode?: "full" | "light";
};

export type RunDailySyncOptions = {
  signal?: AbortSignal;
  /** Sincroniza só este `playerGroup` (nome do grupo no SharkScope). Pula sync de stats por nick×rede. */
  onlyPlayerGroup?: string;
  /**
   * `light` — só `statistics` (lifetime + Date:10D/30D/90D), sem `completedTournaments` (poupa buscas).
   * `full` — statistics + paginação CT + breakdown por tipo (Bounty/Sat/vanilla) a partir das linhas.
   */
  syncMode?: "full" | "light";
};

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
 * Por grupo: `statistics` lifetime + `statistics` com `Date:10D` / `Date:30D` / `Date:90D` (API — alinha ROI/FP/FT ao site).
 * Modo `full`: adiciona `completedTournaments` (90d) paginado para `group_site_breakdown_*` e cortes por tipo.
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
  const syncMode = options?.syncMode ?? "full";

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
      log.info(`Modo grupo único: "${want}" (${one.length} jogador(es)); sync por nick×rede desligado.`);
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

      const statsPathLifetime = playerGroupStatisticsPath(groupName);
      const rawLifetime = await getOrFetchSharkScope(
        primaryNick.id,
        "stats_lifetime",
        "?lifetime",
        () => countedSharkScopeGet(statsPathLifetime),
        24,
        forceRefresh
      );

      const remLifetime = extractRemainingSearches(rawLifetime);
      if (remLifetime !== null) remainingSearches = remLifetime;

      const rawStats10d = await getOrFetchSharkScope(
        primaryNick.id,
        "stats_10d",
        SHARKSCOPE_STATS_FILTER_10D,
        () => countedSharkScopeGet(playerGroupStatisticsPath(groupName, "Date:10D")),
        24,
        forceRefresh
      );
      const rem10 = extractRemainingSearches(rawStats10d);
      if (rem10 !== null) remainingSearches = rem10;

      const rawStats30d = await getOrFetchSharkScope(
        primaryNick.id,
        "stats_30d",
        SHARKSCOPE_STATS_FILTER_30D,
        () => countedSharkScopeGet(playerGroupStatisticsPath(groupName, "Date:30D")),
        24,
        forceRefresh
      );
      const rem30 = extractRemainingSearches(rawStats30d);
      if (rem30 !== null) remainingSearches = rem30;

      const rawStats90d = await getOrFetchSharkScope(
        primaryNick.id,
        "stats_90d",
        SHARKSCOPE_STATS_FILTER_90D,
        () => countedSharkScopeGet(playerGroupStatisticsPath(groupName, "Date:90D")),
        24,
        forceRefresh
      );
      const rem90 = extractRemainingSearches(rawStats90d);
      if (rem90 !== null) remainingSearches = rem90;

      let allRows: TournamentRow[] = [];
      if (syncMode === "full") {
        allRows = await syncGroupSiteBreakdownForGroup(
          primaryNick.id,
          groupName,
          forceRefresh,
          countedSharkScopeGet,
          signal
        );
      } else {
        log.info(
          `[${groupName}] sync leve: sem completedTournaments — KPIs vêm da API; breakdown por rede só atualiza em sync full.`
        );
      }

      if (syncMode === "full" && allRows.length > 0) {
        const cutoff30d = daysAgoTimestamp(30);
        const rows30d = filterTournamentRows(allRows, { afterTimestamp: cutoff30d });
        const bountyRows30 = filterTournamentRows(rows30d, { tournamentType: "bounty" });
        const satRows30 = filterTournamentRows(rows30d, { tournamentType: "satellite" });
        const vanillaRows30 = filterTournamentRows(rows30d, { tournamentType: "vanilla" });

        await saveComputedStats(primaryNick.id, "stats_30d", `?filter=${encodeURIComponent("Date:30D;Type:B")}`, computeStatsFromRows(bountyRows30), forceRefresh);
        await saveComputedStats(primaryNick.id, "stats_30d", `?filter=${encodeURIComponent("Date:30D;Type:SAT")}`, computeStatsFromRows(satRows30), forceRefresh);
        await saveComputedStats(primaryNick.id, "stats_30d", `?filter=${encodeURIComponent("Date:30D;Type!:B;Type!:SAT")}`, computeStatsFromRows(vanillaRows30), forceRefresh);
      }

      // Replicar caches para membros do grupo
      for (const member of members.slice(1)) {
        const memberNick = await upsertGroupNick(member.id);
        await replicateSharkScopeCachesToPlayerNick(primaryNick.id, memberNick.id);
      }

      const avgEntrants30d = extractStat(rawLifetime, "AvEntrants");
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
        `✅ [${groupName}] Sincronizado (${members.length} jogador(es), ${syncMode === "full" ? `${allRows.length} torneios 90d (CT)` : "sem CT"}) | ROI(10d): ${roi10d != null ? roi10d.toFixed(1) : "-"} | FP(10d): ${earlyFinish10d != null ? earlyFinish10d.toFixed(1) : "-"} | FT(10d): ${lateFinish10d != null ? lateFinish10d.toFixed(1) : "-"}`
      );

      processed += members.length;
    } catch (err) {
      if (isAbortError(err)) throw err;
      errors++;
      const errMsg = err instanceof Error ? err.message : String(err);
      const lower = errMsg.toLowerCase();
      const isGroupUnavailable = lower.includes("not found") || lower.includes("opted out");

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
  const siteNicks = await prisma.playerNick.findMany({
    where: { isActive: true, network: { in: siteNetworks } },
    select: { id: true, nick: true, network: true },
  });

  const skipSiteNickStats = Boolean(options?.onlyPlayerGroup?.trim());

  if (skipSiteNickStats) {
    log.info("SharkScope: sync por nick×rede omitido (sync de grupo único).");
  } else if (sharkscopeSyncSiteNicksEnabled()) {
    log.info(`SharkScope: sincronizando ${siteNicks.length} nicks por rede (analytics legado — SHARKSCOPE_SYNC_SITE_NICKS)`);
  } else {
    log.info(
      "SharkScope: sync por nick×rede desativado (use SHARKSCOPE_SYNC_SITE_NICKS=1 para reativar). Por site vem de group_site_breakdown_*."
    );
  }

  if (!skipSiteNickStats && sharkscopeSyncSiteNicksEnabled()) {
    for (const pn of siteNicks) {
      throwIfAborted(signal);
      try {
        const enc = encodeURIComponent(pn.nick);
        const pathSite30 = `/networks/${pn.network}/players/${enc}/statistics/AvROI,Count,TotalProfit,AvStake,AvEntrants,FinshesEarly,FinshesLate,Entrants?filter=Date:30D`;
        const pathSite90 = `/networks/${pn.network}/players/${enc}/statistics/AvROI,Count,TotalProfit,AvStake,AvEntrants,FinshesEarly,FinshesLate,Entrants${SHARKSCOPE_STATS_FILTER_90D}`;
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
