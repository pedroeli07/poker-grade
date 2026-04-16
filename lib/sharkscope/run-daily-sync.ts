// lib/sharkscope/run-daily-sync.ts
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { isSharkScopePlayerGroupUnavailableMessage, sharkScopeGet } from "@/lib/utils";
import { getOrFetchSharkScope, replicateSharkScopeCachesToPlayerNick } from "@/lib/sharkscope-cache";
import { syncGroupSiteBreakdownForGroup, type SharkScopeGetFn } from "@/lib/sharkscope/group-site-breakdown-sync";
import {computeStatsFromRows,filterTournamentRows,type TournamentRow,} from "@/lib/sharkscope/completed-tournaments-aggregate";
import {playerGroupStatisticsPath,SHARKSCOPE_PLAYER_GROUP_STATS_IDS,sharkscopeSyncSiteNicksEnabled,} from "@/lib/constants/sharkscope-group-site";
import {
  extractStat,
  extractRemainingSearches,
  roiSeverity,
  reentrySeverity,
  earlyFinishSeverity,
  lateFinishSeverity,
} from "@/lib/sharkscope-parse";
import { createLogger } from "@/lib/logger";
import {POKER_NETWORKS,sharkScopeAppName,sharkScopeAppKey,sharkscopeApiNetworkSegment} from "@/lib/constants";
import {SHARKSCOPE_STATS_FILTER_10D,SHARKSCOPE_STATS_FILTER_30D,SHARKSCOPE_STATS_FILTER_90D} from "@/lib/constants/sharkscope-type-filters";
import { ErrorTypes } from "@/lib/types";
import type {DailySyncSharkScopeResult,RunDailySyncOptions,SharkScopeSyncMode} from "@/lib/types/sharkScopeTypes";

const log = createLogger("cron.daily-sync");

// ─── Mode config ──────────────────────────────────────────────────────────────

/** Flags derivadas do syncMode — substitui as 3 funções `should*` anteriores. */
const MODE_FLAGS: Record<SharkScopeSyncMode, { stats10: boolean; stats3090: boolean; ct: boolean }> = {
  players:        { stats10: true,  stats3090: false, ct: false },
  light:          { stats10: true,  stats3090: true,  ct: false },
  analytics:      { stats10: false, stats3090: true,  ct: true  },
  analytics_nick: { stats10: false, stats3090: true,  ct: false },
  full:           { stats10: true,  stats3090: true,  ct: true  },
};

/** Tipos de torneio e seus filtros 30d/90d para o breakdown por CT. */
const CT_TYPE_BREAKDOWN = [
  { type: "bounty"    as const, f30: "Date:30D;Type:B",            f90: "Date:90D;Type:B"            },
  { type: "satellite" as const, f30: "Date:30D;Type:SAT",          f90: "Date:90D;Type:SAT"          },
  { type: "vanilla"   as const, f30: "Date:30D;Type!:B;Type!:SAT", f90: "Date:90D;Type!:B;Type!:SAT" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAbortError(e: unknown): boolean {
  return (
    (typeof DOMException !== "undefined" && e instanceof DOMException && e.name === "AbortError") ||
    (e instanceof Error && e.name === "AbortError")
  );
}

function throwIfAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) throw new DOMException("Sincronização cancelada", "AbortError");
}

function daysAgoTimestamp(days: number): number {
  return Math.floor(Date.now() / 1000) - days * 86400;
}

function safeRevalidate() {
  try { revalidateTag("sharkscope-analytics", "max"); } catch { /* ignore */ }
}

/**
 * Cria um alerta tipado se a severidade for `red` ou `yellow`.
 * Retorna `null` caso contrário — evita os 5 blocos `if/push` repetidos.
 */
function buildAlertIfSevere(
  playerId: string,
  alertType: string,
  value: number | null,
  severityFn: (v: number) => string,
  threshold: number,
  context: Record<string, unknown>
): Prisma.AlertLogCreateManyInput | null {
  if (value === null) return null;
  const severity = severityFn(value);
  if (severity !== "red" && severity !== "yellow") return null;
  return { playerId, alertType, severity, metricValue: value, threshold, context: context as Prisma.InputJsonValue };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * Núcleo do sync SharkScope (cron e botão manual).
 * Ver comentário original para detalhes de modos e comportamento por grupo.
 */
export async function runDailySyncSharkScope(
  forceRefresh: boolean,
  options?: RunDailySyncOptions
): Promise<DailySyncSharkScopeResult> {
  if (!sharkScopeAppName) throw new Error(ErrorTypes.SHARK_SYNC_APP_NAME_NOT_CONFIGURED);
  if (!sharkScopeAppKey)  throw new Error(ErrorTypes.SHARK_SYNC_APP_KEY_NOT_CONFIGURED);

  const signal = options?.signal;
  const syncMode: SharkScopeSyncMode = options?.syncMode ?? "full";
  const { stats10: need10, stats3090: need3090, ct: needCT } = MODE_FLAGS[syncMode];

  log.info("Iniciando daily-sync SharkScope", { forceRefresh, syncMode });

  let sharkHttpCalls = 0;
  const countedSharkScopeGet: SharkScopeGetFn = (path, init?) => {
    sharkHttpCalls++;
    return sharkScopeGet(path, { ...init, signal: init?.signal ?? signal });
  };

  // Closure que atualiza `remainingSearches` sem repetição inline
  let remainingSearches: number | null = null;
  const trackRemaining = (raw: unknown) => {
    const r = extractRemainingSearches(raw);
    if (r !== null) remainingSearches = r;
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
      log.info(
        syncMode === "analytics_nick"
          ? `Modo grupo único (analytics_nick): "${want}" (${one.length} jogador(es)); statistics por nick×rede só para este(s).`
          : `Modo grupo único: "${want}" (${one.length} jogador(es)); sync por nick×rede desligado.`
      );
    } else {
      log.warn(`Nenhum jogador ativo com playerGroup exatamente "${want}".`);
    }
  }

  let processed = 0;
  let errors = 0;

  try {
    for (const [groupName, members] of byGroup) {
      throwIfAborted(signal);
      const primaryPlayer = members[0]!;

      try {
        const upsertGroupNick = (playerId: string) =>
          prisma.playerNick.upsert({
            where: { playerId_nick_network: { playerId, nick: groupName, network: "PlayerGroup" } },
            update: {},
            create: { playerId, nick: groupName, network: "PlayerGroup", isActive: true },
          });

        const primaryNick = await upsertGroupNick(primaryPlayer.id);

        // ── Fetch statistics por período ──────────────────────────────────────
        let rawStats10d: unknown;
        let rawStats30d: unknown;
        let rawStats90d: unknown;

        if (need10) {
          rawStats10d = await getOrFetchSharkScope(
            primaryNick.id, "stats_10d", SHARKSCOPE_STATS_FILTER_10D,
            () => countedSharkScopeGet(playerGroupStatisticsPath(groupName, "Date:10D")),
            24, forceRefresh
          );
          trackRemaining(rawStats10d);
        }

        if (need3090) {
          rawStats30d = await getOrFetchSharkScope(
            primaryNick.id, "stats_30d", SHARKSCOPE_STATS_FILTER_30D,
            () => countedSharkScopeGet(playerGroupStatisticsPath(groupName, "Date:30D")),
            24, forceRefresh
          );
          trackRemaining(rawStats30d);

          rawStats90d = await getOrFetchSharkScope(
            primaryNick.id, "stats_90d", SHARKSCOPE_STATS_FILTER_90D,
            () => countedSharkScopeGet(playerGroupStatisticsPath(groupName, "Date:90D")),
            24, forceRefresh
          );
          trackRemaining(rawStats90d);
        }

        // ── CompletedTournaments + breakdown por tipo ─────────────────────────
        let allRows: TournamentRow[] = [];
        if (needCT) {
          allRows = await syncGroupSiteBreakdownForGroup(
            primaryNick.id, groupName, forceRefresh, countedSharkScopeGet, signal
          );

          if (allRows.length > 0) {
            const rows30d = filterTournamentRows(allRows, { afterTimestamp: daysAgoTimestamp(30) });
            for (const { type, f30, f90 } of CT_TYPE_BREAKDOWN) {
              await saveComputedStats(
                primaryNick.id, "stats_30d",
                `?filter=${encodeURIComponent(f30)}`,
                computeStatsFromRows(filterTournamentRows(rows30d, { tournamentType: type })),
                forceRefresh
              );
              await saveComputedStats(
                primaryNick.id, "stats_90d",
                `?filter=${encodeURIComponent(f90)}`,
                computeStatsFromRows(filterTournamentRows(allRows, { tournamentType: type })),
                forceRefresh
              );
            }
          }
        }

        // ── Log de modo ───────────────────────────────────────────────────────
        const MODE_LOGS: Partial<Record<SharkScopeSyncMode, string>> = {
          analytics:      `[${groupName}] modo analytics: CT + stats 30d/90d; 10d não atualizado neste run.`,
          light:          `[${groupName}] sync leve: statistics 10d/30d/90d sem completedTournaments.`,
          players:        `[${groupName}] modo players: só Date:10D; sem lifetime/30d/90d/CT.`,
          analytics_nick: `[${groupName}] modo analytics_nick: statistics 30d/90d; sem CT.`,
        };
        const modeMsg = MODE_LOGS[syncMode];
        if (modeMsg) log.info(modeMsg);

        // ── Replicar caches para demais membros ───────────────────────────────
        for (const member of members.slice(1)) {
          const memberNick = await upsertGroupNick(member.id);
          await replicateSharkScopeCachesToPlayerNick(primaryNick.id, memberNick.id);
        }

        // ── Alertas ───────────────────────────────────────────────────────────
        const roi10d         = extractStat(rawStats10d, "TotalROI");
        const earlyFinish10d = extractStat(rawStats10d, "EarlyFinish");
        const lateFinish10d  = extractStat(rawStats10d, "LateFinish");
        const avgEntrants30d = rawStats30d != null ? extractStat(rawStats30d, "AvEntrants") : null;
        const count30d       = extractStat(rawStats30d, "Count");
        const entrants30d    = extractStat(rawStats30d, "Entries");

        const reentryRate =
          count30d != null && count30d > 0 && entrants30d != null && entrants30d > count30d
            ? (entrants30d / count30d - 1) * 100
            : null;

        const alertsToCreate: Prisma.AlertLogCreateManyInput[] = [];

        for (const player of members) {
          const ctx10d = { groupName, period: "10d" };
          const ctx30d = { groupName, period: "30d" };

          const candidates = [
            buildAlertIfSevere(player.id, "roi_drop",      roi10d,         roiSeverity,         roi10d != null && roiSeverity(roi10d) === "red" ? -40 : -20, ctx10d),
            buildAlertIfSevere(player.id, "early_finish",  earlyFinish10d, earlyFinishSeverity, 8,  ctx10d),
            buildAlertIfSevere(player.id, "late_finish",   lateFinish10d,  lateFinishSeverity,  8,  ctx10d),
            buildAlertIfSevere(player.id, "reentry_high",  reentryRate,    reentrySeverity,     25, { ...ctx30d, count: count30d, entrants: entrants30d }),
          ];

          for (const alert of candidates) {
            if (alert) alertsToCreate.push(alert);
          }

          if (avgEntrants30d !== null && avgEntrants30d > 1200) {
            alertsToCreate.push({
              playerId: player.id, alertType: "high_variance", severity: "yellow",
              metricValue: avgEntrants30d, threshold: 1200, context: ctx30d,
            });
          }
        }

        const memberIds = members.map((p) => p.id);
        await prisma.alertLog.deleteMany({ where: { playerId: { in: memberIds }, alertType: "group_not_found" } });
        if (alertsToCreate.length > 0) {
          await prisma.alertLog.createMany({ data: alertsToCreate });
        }

        // ── Log alertas ativos (1 por grupo, via primary player) ──────────────
        for (const a of alertsToCreate) {
          if (a.playerId === primaryPlayer.id) {
            log.warn(`Alerta ${a.alertType} (${(a.context as Record<string, unknown>).period ?? ""})`, {
              groupName, value: a.metricValue?.toFixed?.(1), severity: a.severity,
            });
          }
        }

        log.info("Grupo sincronizado", {
          groupName, members: members.length, syncMode,
          tourneysCount: needCT ? allRows.length : null,
          roi10d: roi10d?.toFixed(1) ?? null,
          fp10d:  earlyFinish10d?.toFixed(1) ?? null,
          ft10d:  lateFinish10d?.toFixed(1) ?? null,
        });

        processed += members.length;
      } catch (err) {
        if (isAbortError(err)) throw err;
        errors++;
        const errMsg = err instanceof Error ? err.message : String(err);

        if (isSharkScopePlayerGroupUnavailableMessage(errMsg)) {
          const ids = members.map((p) => p.id);
          await prisma.alertLog.deleteMany({ where: { playerId: { in: ids }, alertType: "group_not_found" } });
          await prisma.alertLog.createMany({
            data: ids.map((playerId) => ({
              playerId, alertType: "group_not_found", severity: "red",
              metricValue: 0, threshold: 0,
              context: { groupName, message: ErrorTypes.SHARK_GROUP_NOT_FOUND },
            })),
          });
          log.warn("SharkScope: grupo não encontrado ou indisponível", { groupName, sharkscope: errMsg });
        } else {
          log.error(`Erro ao processar grupo ${groupName}`, err instanceof Error ? err : undefined, { groupName });
        }
      }
    }

    // ── Sync por nick×rede ────────────────────────────────────────────────────
    const siteNetworks   = Object.keys(POKER_NETWORKS);
    const nickSyncPlayerIds =
      syncMode === "analytics_nick" && options?.onlyPlayerGroup?.trim()
        ? [...byGroup.values()].flat().map((p) => p.id)
        : null;

    const siteNicks = await prisma.playerNick.findMany({
      where: {
        isActive: true,
        network: { in: siteNetworks },
        ...(nickSyncPlayerIds?.length ? { playerId: { in: nickSyncPlayerIds } } : {}),
      },
      select: { id: true, nick: true, network: true },
    });

    const skipSiteNickStats  = Boolean(options?.onlyPlayerGroup?.trim()) && syncMode !== "analytics_nick";
    const shouldRunNickSiteSync = !skipSiteNickStats && (sharkscopeSyncSiteNicksEnabled() || syncMode === "analytics_nick");

    if (skipSiteNickStats) {
      log.info("SharkScope: sync por nick×rede omitido (sync de grupo único em modo analytics).");
    } else if (shouldRunNickSiteSync) {
      log.info(`SharkScope: statistics por nick×rede (${siteNicks.length} nicks) — modo ${syncMode}.`);
    } else {
      log.info("SharkScope: sync por nick×rede desativado (use analytics_nick, ou SHARKSCOPE_SYNC_SITE_NICKS=1).");
    }

    if (shouldRunNickSiteSync) {
      for (const pn of siteNicks) {
        throwIfAborted(signal);
        try {
          const enc    = encodeURIComponent(pn.nick);
          const apiNet = sharkscopeApiNetworkSegment(pn.network);
          const [rawSite30, rawSite90] = await Promise.all([
            getOrFetchSharkScope(pn.id, "stats_30d", "?filter=Date:30D",
              () => countedSharkScopeGet(`/networks/${apiNet}/players/${enc}/statistics/${SHARKSCOPE_PLAYER_GROUP_STATS_IDS}?filter=${encodeURIComponent("Date:30D")}`),
              24, forceRefresh),
            getOrFetchSharkScope(pn.id, "stats_90d", SHARKSCOPE_STATS_FILTER_90D,
              () => countedSharkScopeGet(`/networks/${apiNet}/players/${enc}/statistics/${SHARKSCOPE_PLAYER_GROUP_STATS_IDS}?filter=${encodeURIComponent("Date:90D")}`),
              24, forceRefresh),
          ]);
          trackRemaining(rawSite30);
          trackRemaining(rawSite90);
        } catch (err) {
          if (isAbortError(err)) throw err;
          log.warn(`[nick-rede] ${pn.network}/${pn.nick}`,
            err instanceof Error ? { message: err.message } : { message: ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR }
          );
        }
      }
    }

    log.info("daily-sync concluído", { sharkHttpCalls, remainingSearches, processed, errors });
    safeRevalidate();

    return { processed, errors, sharkHttpCalls, remainingSearches, ts: new Date().toISOString(), syncMode };
  } catch (e) {
    if (isAbortError(e)) {
      log.info("daily-sync cancelado pelo cliente", { sharkHttpCalls, processed, errors });
      safeRevalidate();
      return { processed, errors, sharkHttpCalls, remainingSearches, ts: new Date().toISOString(), cancelled: true, syncMode };
    }
    throw e;
  }
}

// ─── saveComputedStats / buildFakeStatsResponse ───────────────────────────────

type ComputedStats = ReturnType<typeof computeStatsFromRows>;

async function saveComputedStats(
  playerNickId: string,
  dataType: string,
  filterKey: string,
  stats: ComputedStats,
  forceRefresh: boolean,
  extraStats?: Record<string, number | null>
) {
  await getOrFetchSharkScope(
    playerNickId, dataType, filterKey,
    async () => buildFakeStatsResponse(stats, extraStats),
    24, forceRefresh
  );
}

function buildFakeStatsResponse(stats: ComputedStats, extra?: Record<string, number | null>): unknown {
  const statistics: Record<string, unknown>[] = [];

  const push = (id: string, value: number | null) => {
    if (value !== null) statistics.push({ "@id": id, "#text": String(value) });
  };

  const statMap: [string, number | null][] = [
    ["Count",         stats.count],
    ["Entries",       stats.entries],
    ["TotalROI",      stats.totalRoi],
    ["AvROI",         stats.totalRoi],
    ["ITM",           stats.itm],
    ["TotalProfit",   stats.totalProfit],
    ["Profit",        stats.totalProfit],
    ["TotalStake",    stats.totalStake],
    ["AvStake",       stats.avStake],
    ["FinishesEarly", stats.earlyFinish],
    ["FinishesLate",  stats.lateFinish],
    ["Entrants",      stats.entries],
  ];

  for (const [id, value] of statMap) push(id, value);
  if (extra) for (const [id, val] of Object.entries(extra)) push(id, val);

  return {
    Response: {
      PlayerResponse: {
        PlayerView: {
          PlayerGroup: { Statistics: { Statistic: statistics } },
        },
      },
      UserInfo: {},
    },
  };
}