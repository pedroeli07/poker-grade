// lib/sharkscope/daily-sync/run-daily-sync.ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { sharkScopeGet } from "@/lib/utils/sharkscope-client";
import { createLogger } from "@/lib/logger";
import { sharkScopeAppName, sharkScopeAppKey } from "@/lib/constants/env";
import { ErrorTypes } from "@/lib/types/primitives";
import type { DailySyncSharkScopeResult, RunDailySyncOptions, SharkScopeSyncMode } from "@/lib/types/sharkScopeTypes";
import type { SharkScopeGetFn } from "@/lib/types/sharkscope/group-sync";
import { DAILY_SYNC_MODE_FLAGS } from "@/lib/constants/sharkscope/daily-sync";
import { sendSharkAlertPlayerEmails, sendSharkAlertStaffDigest } from "@/lib/email/app-events";
import {
  extractRemainingSearches,
} from "@/lib/sharkscope-parse";
import {
  isAbortError,
  throwIfAborted,
  safeRevalidateSharkscopeAnalytics,
} from "@/lib/sharkscope/daily-sync/sync-abort";
import { buildTeamRelativeAlerts } from "@/lib/sharkscope/daily-sync/daily-sync-team-alerts";
import { runNickSiteStatisticsSync } from "@/lib/sharkscope/daily-sync/daily-sync-nick-site";
import type {
  DailySyncGroupLoopContext,
  DailySyncPlayerRow,
  GroupTenDMetric,
} from "@/lib/types/sharkscope/daily-sync";
import { syncOnePlayerGroup } from "@/lib/sharkscope/daily-sync/sync-one-player-group";

const log = createLogger("cron.daily-sync");

function buildPlayersByGroup(players: DailySyncPlayerRow[]): Map<string, DailySyncPlayerRow[]> {
  const byGroupAll = new Map<string, DailySyncPlayerRow[]>();
  for (const p of players) {
    const g = p.playerGroup!;
    if (!byGroupAll.has(g)) byGroupAll.set(g, []);
    byGroupAll.get(g)!.push(p);
  }
  return byGroupAll;
}

function applyOnlyPlayerGroupFilter(
  byGroupAll: Map<string, DailySyncPlayerRow[]>,
  onlyPlayerGroup: string | undefined,
  syncMode: SharkScopeSyncMode
): Map<string, DailySyncPlayerRow[]> {
  if (!onlyPlayerGroup?.trim()) return byGroupAll;

  const want = onlyPlayerGroup.trim();
  const one = byGroupAll.get(want);
  const byGroup = new Map<string, DailySyncPlayerRow[]>();
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
  return byGroup;
}

/**
 * Núcleo do sync SharkScope (cron e botão manual).
 * Ver comentário original para detalhes de modos e comportamento por grupo.
 */
export async function runDailySyncSharkScope(
  forceRefresh: boolean,
  options?: RunDailySyncOptions
): Promise<DailySyncSharkScopeResult> {
  if (!sharkScopeAppName) throw new Error(ErrorTypes.SHARK_SYNC_APP_NAME_NOT_CONFIGURED);
  if (!sharkScopeAppKey) throw new Error(ErrorTypes.SHARK_SYNC_APP_KEY_NOT_CONFIGURED);

  const signal = options?.signal;
  const syncMode: SharkScopeSyncMode = options?.syncMode ?? "full";
  const { stats10: need10, stats3090: need3090, ct: needCT } = DAILY_SYNC_MODE_FLAGS[syncMode];

  log.info("Iniciando daily-sync SharkScope", { forceRefresh, syncMode });

  let sharkHttpCalls = 0;
  const countedSharkScopeGet: SharkScopeGetFn = (path, init?) => {
    sharkHttpCalls++;
    return sharkScopeGet(path, { ...init, signal: init?.signal ?? signal });
  };

  let remainingSearches: number | null = null;
  const trackRemaining = (raw: unknown) => {
    const r = extractRemainingSearches(raw);
    if (r !== null) remainingSearches = r;
  };

  const players = await prisma.player.findMany({
    where: { status: "ACTIVE", playerGroup: { not: null } },
    select: { id: true, name: true, playerGroup: true },
  });

  const playerNameById = new Map(players.map((p) => [p.id, p.name]));
  const groupTenDMetrics: GroupTenDMetric[] = [];
  const allAlertsThisRun: Prisma.AlertLogCreateManyInput[] = [];

  log.info(`Processando ${players.length} jogadores ativos (playerGroup), agrupados por nome de grupo`);

  const byGroupAll = buildPlayersByGroup(players as DailySyncPlayerRow[]);
  const byGroup = applyOnlyPlayerGroupFilter(byGroupAll, options?.onlyPlayerGroup, syncMode);

  const loopCtx: DailySyncGroupLoopContext = {
    syncMode,
    need10,
    need3090,
    needCT,
    forceRefresh,
    signal,
    countedSharkScopeGet,
    trackRemaining,
    playerNameById,
    allAlertsThisRun,
  };

  let processed = 0;
  let errors = 0;

  try {
    for (const [groupName, members] of byGroup) {
      throwIfAborted(signal);
      const outcome = await syncOnePlayerGroup(loopCtx, groupName, members);
      if (outcome.kind === "success") {
        processed += outcome.processed;
        if (outcome.groupTenDMetric) groupTenDMetrics.push(outcome.groupTenDMetric);
      } else {
        errors++;
      }
    }

    if (need10 && groupTenDMetrics.length >= 2) {
      const teamAlerts = buildTeamRelativeAlerts(groupTenDMetrics);
      if (teamAlerts.length > 0) {
        await prisma.alertLog.createMany({ data: teamAlerts });
        allAlertsThisRun.push(...teamAlerts);
        void sendSharkAlertPlayerEmails(teamAlerts, playerNameById);
      }
    }
    void sendSharkAlertStaffDigest(allAlertsThisRun, playerNameById);

    const nickSyncPlayerIds =
      syncMode === "analytics_nick" && options?.onlyPlayerGroup?.trim()
        ? [...byGroup.values()].flat().map((p) => p.id)
        : null;

    await runNickSiteStatisticsSync({
      syncMode,
      onlyPlayerGroup: options?.onlyPlayerGroup,
      nickSyncPlayerIds,
      signal,
      countedSharkScopeGet,
      trackRemaining,
      forceRefresh,
    });

    log.info("daily-sync concluído", { sharkHttpCalls, remainingSearches, processed, errors });
    safeRevalidateSharkscopeAnalytics();

    return { processed, errors, sharkHttpCalls, remainingSearches, ts: new Date().toISOString(), syncMode };
  } catch (e) {
    if (isAbortError(e)) {
      log.info("daily-sync cancelado pelo cliente", { sharkHttpCalls, processed, errors });
      safeRevalidateSharkscopeAnalytics();
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
