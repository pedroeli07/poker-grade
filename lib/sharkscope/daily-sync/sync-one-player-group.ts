import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrFetchSharkScope, replicateSharkScopeCachesToPlayerNick } from "@/lib/sharkscope-cache";
import { syncGroupSiteBreakdownForGroup } from "@/lib/sharkscope/group-site/group-site-breakdown-sync";
import { computeStatsFromRows, filterTournamentRows, type TournamentRow } from "@/lib/sharkscope/completed-tournaments-aggregate";
import { playerGroupStatisticsPath } from "@/lib/constants/sharkscope/group-site";
import {
  extractStat,
  roiSeverity,
  reentrySeverity,
  earlyFinishSeverity,
  lateFinishSeverity,
} from "@/lib/sharkscope-parse";
import { createLogger } from "@/lib/logger";
import {
  SHARKSCOPE_STATS_FILTER_10D,
  SHARKSCOPE_STATS_FILTER_30D,
  SHARKSCOPE_STATS_FILTER_90D,
} from "@/lib/constants/sharkscope/type-filters";
import { ErrorTypes } from "@/lib/types/primitives";
import { dailySyncModeLogMessage, SHARKSCOPE_CT_TYPE_BREAKDOWN } from "@/lib/constants/sharkscope/daily-sync";
import { sendSharkAlertPlayerEmails } from "@/lib/email/app-events";
import { isSharkScopePlayerGroupUnavailableMessage } from "@/lib/utils/sharkscope-client";
import { isAbortError, throwIfAborted, daysAgoTimestamp } from "@/lib/sharkscope/daily-sync/sync-abort";
import { saveComputedStats } from "@/lib/sharkscope/daily-sync/daily-sync-computed";
import type { DailySyncGroupLoopContext, DailySyncPlayerRow, GroupTenDMetric } from "@/lib/types/sharkscope/daily-sync";

const log = createLogger("cron.daily-sync.group");

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

async function fetchGroupStatistics(
  ctx: DailySyncGroupLoopContext,
  groupName: string,
  primaryNickId: string
): Promise<{ rawStats10d: unknown; rawStats30d: unknown; rawStats90d: unknown }> {
  let rawStats10d: unknown;
  let rawStats30d: unknown;
  let rawStats90d: unknown;

  if (ctx.need10) {
    rawStats10d = await getOrFetchSharkScope(
      primaryNickId,
      "stats_10d",
      SHARKSCOPE_STATS_FILTER_10D,
      () => ctx.countedSharkScopeGet(playerGroupStatisticsPath(groupName, "Date:10D")),
      24,
      ctx.forceRefresh
    );
    ctx.trackRemaining(rawStats10d);
  }

  if (ctx.need3090) {
    rawStats30d = await getOrFetchSharkScope(
      primaryNickId,
      "stats_30d",
      SHARKSCOPE_STATS_FILTER_30D,
      () => ctx.countedSharkScopeGet(playerGroupStatisticsPath(groupName, "Date:30D")),
      24,
      ctx.forceRefresh
    );
    ctx.trackRemaining(rawStats30d);

    rawStats90d = await getOrFetchSharkScope(
      primaryNickId,
      "stats_90d",
      SHARKSCOPE_STATS_FILTER_90D,
      () => ctx.countedSharkScopeGet(playerGroupStatisticsPath(groupName, "Date:90D")),
      24,
      ctx.forceRefresh
    );
    ctx.trackRemaining(rawStats90d);
  }

  return { rawStats10d, rawStats30d, rawStats90d };
}

async function runCompletedTournamentsTypeBreakdown(
  ctx: DailySyncGroupLoopContext,
  primaryNickId: string,
  groupName: string
): Promise<TournamentRow[]> {
  if (!ctx.needCT) return [];
  const allRows = await syncGroupSiteBreakdownForGroup(
    primaryNickId,
    groupName,
    ctx.forceRefresh,
    ctx.countedSharkScopeGet,
    ctx.signal
  );

  if (allRows.length === 0) return allRows;

  const rows30d = filterTournamentRows(allRows, { afterTimestamp: daysAgoTimestamp(30) });
  for (const { type, f30, f90 } of SHARKSCOPE_CT_TYPE_BREAKDOWN) {
    await saveComputedStats(
      primaryNickId,
      "stats_30d",
      `?filter=${encodeURIComponent(f30)}`,
      computeStatsFromRows(filterTournamentRows(rows30d, { tournamentType: type })),
      ctx.forceRefresh
    );
    await saveComputedStats(
      primaryNickId,
      "stats_90d",
      `?filter=${encodeURIComponent(f90)}`,
      computeStatsFromRows(filterTournamentRows(allRows, { tournamentType: type })),
      ctx.forceRefresh
    );
  }
  return allRows;
}

function buildMemberAlerts(
  members: DailySyncPlayerRow[],
  groupName: string,
  rawStats10d: unknown,
  rawStats30d: unknown
): Prisma.AlertLogCreateManyInput[] {
  const roi10d = extractStat(rawStats10d, "TotalROI");
  const earlyFinish10d = extractStat(rawStats10d, "EarlyFinish");
  const lateFinish10d = extractStat(rawStats10d, "LateFinish");
  const avgEntrants30d = rawStats30d != null ? extractStat(rawStats30d, "AvEntrants") : null;
  const count30d = extractStat(rawStats30d, "Count");
  const entrants30d = extractStat(rawStats30d, "Entries");

  const reentryRate =
    count30d != null && count30d > 0 && entrants30d != null && entrants30d > count30d
      ? (entrants30d / count30d - 1) * 100
      : null;

  const alertsToCreate: Prisma.AlertLogCreateManyInput[] = [];

  for (const player of members) {
    const ctx10d = { groupName, period: "10d" };
    const ctx30d = { groupName, period: "30d" };

    const candidates = [
      buildAlertIfSevere(
        player.id,
        "roi_drop",
        roi10d,
        roiSeverity,
        roi10d != null && roiSeverity(roi10d) === "red" ? -40 : -20,
        ctx10d
      ),
      buildAlertIfSevere(player.id, "early_finish", earlyFinish10d, earlyFinishSeverity, 8, ctx10d),
      buildAlertIfSevere(player.id, "late_finish", lateFinish10d, lateFinishSeverity, 8, ctx10d),
      buildAlertIfSevere(player.id, "reentry_high", reentryRate, reentrySeverity, 25, {
        ...ctx30d,
        count: count30d,
        entrants: entrants30d,
      }),
    ];

    for (const alert of candidates) {
      if (alert) alertsToCreate.push(alert);
    }

    if (avgEntrants30d !== null && avgEntrants30d > 1200) {
      alertsToCreate.push({
        playerId: player.id,
        alertType: "high_variance",
        severity: "yellow",
        metricValue: avgEntrants30d,
        threshold: 1200,
        context: ctx30d,
      });
    }
  }

  return alertsToCreate;
}

async function persistGroupAlertsAndNotify(
  memberIds: string[],
  alertsToCreate: Prisma.AlertLogCreateManyInput[],
  ctx: DailySyncGroupLoopContext
) {
  await prisma.alertLog.deleteMany({ where: { playerId: { in: memberIds }, alertType: "group_not_found" } });
  if (alertsToCreate.length > 0) {
    await prisma.alertLog.createMany({ data: alertsToCreate });
    ctx.allAlertsThisRun.push(...alertsToCreate);
    void sendSharkAlertPlayerEmails(alertsToCreate, ctx.playerNameById);
  }
}

function logActiveAlertsForPrimary(
  alertsToCreate: Prisma.AlertLogCreateManyInput[],
  primaryPlayerId: string,
  groupName: string
) {
  for (const a of alertsToCreate) {
    if (a.playerId === primaryPlayerId) {
      log.warn(`Alerta ${a.alertType} (${(a.context as Record<string, unknown>).period ?? ""})`, {
        groupName,
        value: a.metricValue?.toFixed?.(1),
        severity: a.severity,
      });
    }
  }
}

async function replicateCachesToOtherMembers(
  members: DailySyncPlayerRow[],
  primaryNickId: string,
  upsertGroupNick: (playerId: string) => Promise<{ id: string }>
) {
  for (const member of members.slice(1)) {
    const memberNick = await upsertGroupNick(member.id);
    await replicateSharkScopeCachesToPlayerNick(primaryNickId, memberNick.id);
  }
}

export type SyncOnePlayerGroupOutcome =
  | { kind: "success"; processed: number; groupTenDMetric?: GroupTenDMetric }
  | { kind: "error" };

/**
 * Sincroniza um `playerGroup`: statistics, CT/breakdown, caches entre membros, alertas.
 */
export async function syncOnePlayerGroup(
  ctx: DailySyncGroupLoopContext,
  groupName: string,
  members: DailySyncPlayerRow[]
): Promise<SyncOnePlayerGroupOutcome> {
  throwIfAborted(ctx.signal);
  const primaryPlayer = members[0]!;

  try {
    const upsertGroupNick = (playerId: string) =>
      prisma.playerNick.upsert({
        where: { playerId_nick_network: { playerId, nick: groupName, network: "PlayerGroup" } },
        update: {},
        create: { playerId, nick: groupName, network: "PlayerGroup", isActive: true },
      });

    const primaryNick = await upsertGroupNick(primaryPlayer.id);

    const stats = await fetchGroupStatistics(ctx, groupName, primaryNick.id);
    const allRows = await runCompletedTournamentsTypeBreakdown(ctx, primaryNick.id, groupName);

    const modeMsg = dailySyncModeLogMessage(ctx.syncMode, groupName);
    if (modeMsg) log.info(modeMsg);

    await replicateCachesToOtherMembers(members, primaryNick.id, upsertGroupNick);

    const alertsToCreate = buildMemberAlerts(members, groupName, stats.rawStats10d, stats.rawStats30d);
    const memberIds = members.map((p) => p.id);
    await persistGroupAlertsAndNotify(memberIds, alertsToCreate, ctx);
    logActiveAlertsForPrimary(alertsToCreate, primaryPlayer.id, groupName);

    const roi10d = extractStat(stats.rawStats10d, "TotalROI");
    const earlyFinish10d = extractStat(stats.rawStats10d, "EarlyFinish");
    const lateFinish10d = extractStat(stats.rawStats10d, "LateFinish");

    log.info("Grupo sincronizado", {
      groupName,
      members: members.length,
      syncMode: ctx.syncMode,
      tourneysCount: ctx.needCT ? allRows.length : null,
      roi10d: roi10d?.toFixed(1) ?? null,
      fp10d: earlyFinish10d?.toFixed(1) ?? null,
      ft10d: lateFinish10d?.toFixed(1) ?? null,
    });

    let groupTenDMetric: GroupTenDMetric | undefined;
    if (ctx.need10) {
      groupTenDMetric = {
        groupName,
        memberIds: members.map((m) => m.id),
        roi: roi10d,
        fp: earlyFinish10d,
        ft: lateFinish10d,
      };
    }

    return { kind: "success", processed: members.length, groupTenDMetric };
  } catch (err) {
    if (isAbortError(err)) throw err;
    const errMsg = err instanceof Error ? err.message : String(err);

    if (isSharkScopePlayerGroupUnavailableMessage(errMsg)) {
      const ids = members.map((p) => p.id);
      await prisma.alertLog.deleteMany({ where: { playerId: { in: ids }, alertType: "group_not_found" } });
      const groupNotFoundAlerts = ids.map((playerId) => ({
        playerId,
        alertType: "group_not_found",
        severity: "red" as const,
        metricValue: 0,
        threshold: 0,
        context: { groupName, message: ErrorTypes.SHARK_GROUP_NOT_FOUND },
      }));
      await prisma.alertLog.createMany({ data: groupNotFoundAlerts });
      ctx.allAlertsThisRun.push(...groupNotFoundAlerts);
      void sendSharkAlertPlayerEmails(groupNotFoundAlerts, ctx.playerNameById);
      log.warn("SharkScope: grupo não encontrado ou indisponível", { groupName, sharkscope: errMsg });
    } else {
      log.error(`Erro ao processar grupo ${groupName}`, err instanceof Error ? err : undefined, { groupName });
    }

    return { kind: "error" };
  }
}
