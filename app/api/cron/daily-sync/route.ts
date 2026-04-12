import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sharkScopeGet } from "@/lib/utils";
import { getOrFetchSharkScope, replicateSharkScopeCachesToPlayerNick } from "@/lib/sharkscope-cache";
import { syncGroupSiteBreakdownForGroup } from "@/lib/sharkscope/group-site-breakdown-sync";
import { sharkscopeSyncSiteNicksEnabled } from "@/lib/constants/sharkscope-group-site";
import {
  extractStat,
  extractRoiTenDayForPlayerTable,
  extractRemainingSearches,
  roiSeverity,
  reentrySeverity,
  earlyFinishSeverity,
  lateFinishSeverity,
} from "@/lib/sharkscope-parse";
import { createLogger } from "@/lib/logger";
import { POKER_NETWORKS, sharkScopeAppName, sharkScopeAppKey, cronSecret } from "@/lib/constants";
import {
  SHARKSCOPE_STATS_FILTER_90D,
  SHARKSCOPE_TYPE_FILTER_KEY,
} from "@/lib/constants/sharkscope-type-filters";
import { ErrorTypes } from "@/lib/types";

const log = createLogger("cron.daily-sync");

export async function GET(request: Request) {
  if (!cronSecret) {
    return NextResponse.json({ error: ErrorTypes.CRON_SECRET_NOT_CONFIGURED }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }

  if (!sharkScopeAppName || !sharkScopeAppKey) {
    return NextResponse.json(
      { error: ErrorTypes.SHARK_SYNC_CREDENTIALS_NOT_CONFIGURED },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const forceRefresh =
    url.searchParams.get("force") === "1" || url.searchParams.get("force") === "true";

  log.info("Iniciando daily-sync SharkScope", { forceRefresh });

  const players = await prisma.player.findMany({
    where: { status: "ACTIVE", playerGroup: { not: null } },
    select: { id: true, name: true, playerGroup: true },
  });

  log.info(`Processando ${players.length} jogadores ativos (playerGroup), agrupados por nome de grupo`);

  const byGroup = new Map<string, typeof players>();
  for (const p of players) {
    const g = p.playerGroup!;
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g)!.push(p);
  }

  let remainingSearches: number | null = null;
  let processed = 0;
  let errors = 0;

  for (const [groupName, members] of byGroup) {
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

      const path10d = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/statistics/Entries,Count,TotalROI,AvROI,ITM,TotalProfit,Profit,AvStake,Ability,FinshesEarly,FinshesLate?filter=Date:10D`;
      const raw10d = await getOrFetchSharkScope(
        primaryNick.id,
        "stats_10d",
        "?filter=Date:10D",
        () => sharkScopeGet(path10d),
        24,
        forceRefresh
      );

      const rem = extractRemainingSearches(raw10d);
      if (rem !== null) remainingSearches = rem;

      const path30d = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/statistics/Entries,Count,TotalROI,AvROI,ITM,TotalProfit,Profit,AvStake,Ability,AvEntrants,FinshesEarly,FinshesLate,Entrants?filter=Date:30D`;

      const raw30d = await getOrFetchSharkScope(
        primaryNick.id,
        "stats_30d",
        "?filter=Date:30D",
        () => sharkScopeGet(path30d),
        24,
        forceRefresh
      );

      const rem30 = extractRemainingSearches(raw30d);
      if (rem30 !== null) remainingSearches = rem30;

      try {
        const path90d = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/statistics/Entries,Count,TotalROI,AvROI,ITM,TotalProfit,Profit,AvStake,Ability,AvEntrants,FinshesEarly,FinshesLate,Entrants${SHARKSCOPE_STATS_FILTER_90D}`;
        const raw90d = await getOrFetchSharkScope(
          primaryNick.id,
          "stats_90d",
          SHARKSCOPE_STATS_FILTER_90D,
          () => sharkScopeGet(path90d),
          24,
          forceRefresh
        );
        const rem90 = extractRemainingSearches(raw90d);
        if (rem90 !== null) remainingSearches = rem90;
      } catch (err) {
        log.warn(
          `[90d] falha ${groupName}`,
          err instanceof Error ? { message: err.message } : { message: ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR }
        );
      }

      const shortStatsBase = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/statistics/Entries,Count,TotalROI,AvROI,ITM,TotalProfit,Profit,AvStake`;
      for (const [label, filterKey] of Object.entries(SHARKSCOPE_TYPE_FILTER_KEY)) {
        try {
          await getOrFetchSharkScope(
            primaryNick.id,
            "stats_30d",
            filterKey,
            () => sharkScopeGet(`${shortStatsBase}${filterKey}`),
            24,
            forceRefresh
          );
        } catch (err) {
          log.warn(
            `[tipo ${label}] falha ${groupName}`,
            err instanceof Error ? { message: err.message } : { message: ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR }
          );
        }
      }

      await syncGroupSiteBreakdownForGroup(primaryNick.id, groupName, forceRefresh);

      for (const member of members.slice(1)) {
        const memberNick = await upsertGroupNick(member.id);
        await replicateSharkScopeCachesToPlayerNick(primaryNick.id, memberNick.id);
      }

      const roi10d = extractRoiTenDayForPlayerTable(raw10d);
      const earlyFinish10d = extractStat(raw10d, "EarlyFinish");
      const lateFinish10d = extractStat(raw10d, "LateFinish");
      const avgEntrants30d = extractStat(raw30d, "AvEntrants");
      const count30d = extractStat(raw30d, "Count");
      const entrants30d = extractStat(raw30d, "Entrants");

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

        if (count30d && count30d > 0 && entrants30d && entrants30d > count30d) {
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
          log.warn(`🚨 [${groupName}] Alerta ROI (10d): ${roi10d}% (${sevRoi})`);
        }
      }
      if (earlyFinish10d !== null) {
        const sevFp = earlyFinishSeverity(earlyFinish10d);
        if (sevFp === "red" || sevFp === "yellow") {
          log.warn(`⚠️ [${groupName}] Alerta FP (10d): ${earlyFinish10d}% (${sevFp})`);
        }
      }
      if (lateFinish10d !== null) {
        const sevFt = lateFinishSeverity(lateFinish10d);
        if (sevFt === "red" || sevFt === "yellow") {
          log.warn(`⚠️ [${groupName}] Alerta FT (10d): ${lateFinish10d}% (${sevFt})`);
        }
      }

      log.info(
        `✅ [${groupName}] Sincronizado (${members.length} jogador(es)) | ROI(10d): ${roi10d ?? "-"} | FP(10d): ${earlyFinish10d ?? "-"} | FT(10d): ${lateFinish10d ?? "-"}`
      );

      processed += members.length;
    } catch (err) {
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

  if (sharkscopeSyncSiteNicksEnabled()) {
    log.info(`SharkScope: sincronizando ${siteNicks.length} nicks por rede (analytics legado — SHARKSCOPE_SYNC_SITE_NICKS)`);
  } else {
    log.info(
      "SharkScope: sync por nick×rede desativado (use SHARKSCOPE_SYNC_SITE_NICKS=1 para reativar). Por site vem de group_site_breakdown_*."
    );
  }

  if (sharkscopeSyncSiteNicksEnabled()) {
    for (const pn of siteNicks) {
      try {
        const enc = encodeURIComponent(pn.nick);
        const pathSite30 = `/networks/${pn.network}/players/${enc}/statistics/AvROI,Count,TotalProfit,AvStake,AvEntrants,FinshesEarly,FinshesLate,Entrants?filter=Date:30D`;
        const rawSite30 = await getOrFetchSharkScope(
          pn.id,
          "stats_30d",
          "?filter=Date:30D",
          () => sharkScopeGet(pathSite30),
          24,
          forceRefresh
        );
        const remS30 = extractRemainingSearches(rawSite30);
        if (remS30 !== null) remainingSearches = remS30;

        const pathSite90 = `/networks/${pn.network}/players/${enc}/statistics/AvROI,Count,TotalProfit,AvStake,AvEntrants,FinshesEarly,FinshesLate,Entrants${SHARKSCOPE_STATS_FILTER_90D}`;
        const rawSite90 = await getOrFetchSharkScope(
          pn.id,
          "stats_90d",
          SHARKSCOPE_STATS_FILTER_90D,
          () => sharkScopeGet(pathSite90),
          24,
          forceRefresh
        );
        const remS90 = extractRemainingSearches(rawSite90);
        if (remS90 !== null) remainingSearches = remS90;
      } catch (err) {
        log.warn(
          `[nick-rede] ${pn.network}/${pn.nick}`,
          err instanceof Error ? { message: err.message } : { message: ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR }
        );
      }
    }
  }

  log.info("daily-sync concluído", { processed, errors, remainingSearches });

  try {
    revalidateTag("sharkscope-analytics", "max");
  } catch {
    /* ignore */
  }

  return NextResponse.json({
    ok: true,
    processed,
    errors,
    remainingSearches,
    ts: new Date().toISOString(),
  });
}
