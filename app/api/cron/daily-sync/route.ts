import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sharkScopeGet } from "@/lib/utils";
import { getOrFetchSharkScope } from "@/lib/sharkscope-cache";
import { extractStat, extractRemainingSearches, roiSeverity, reentrySeverity, earlyFinishSeverity, lateFinishSeverity } from "@/lib/sharkscope-parse";
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
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sharkScopeAppName || !sharkScopeAppKey) {
    return NextResponse.json(
      { error: "SharkScope credentials not configured." },
      { status: 503 }
    );
  }

  log.info("Iniciando daily-sync SharkScope");

  const players = await prisma.player.findMany({
    where: { status: "ACTIVE", playerGroup: { not: null } },
    select: { id: true, name: true, playerGroup: true },
  });

  log.info(`Processando ${players.length} grupos de jogadores (playerGroup) ativos`);

  let remainingSearches: number | null = null;
  let processed = 0;
  let errors = 0;

  for (const player of players) {
    const groupName = player.playerGroup!;
    log.debug(`Syncing grupo ${groupName} do jogador ${player.name}`);

    try {
      // Ensure pseudo-nick exists for caching
      const groupNick = await prisma.playerNick.upsert({
        where: {
          playerId_nick_network: {
            playerId: player.id,
            nick: groupName,
            network: "PlayerGroup",
          },
        },
        update: {},
        create: {
          playerId: player.id,
          nick: groupName,
          network: "PlayerGroup",
          isActive: true,
        },
      });

      // Fetch stats_10d via PlayerGroup /statistics com campos específicos (ROI, FP, FT)
      const path10d = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/statistics/AvROI,Count,TotalProfit,AvStake,FinshesEarly,FinshesLate?filter=Date:10D`;
      log.debug(`[10d] URL: ${path10d}`);
      const raw10d = await getOrFetchSharkScope(
        groupNick.id,
        "stats_10d",
        "?filter=Date:10D",
        () => sharkScopeGet(path10d),
        24
      );


      const rem = extractRemainingSearches(raw10d);
      if (rem !== null) remainingSearches = rem;

      // Fetch stats_30d via PlayerGroup network specifier
      const path30d = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/statistics/AvROI,Count,TotalProfit,AvStake,AvEntrants,FinshesEarly,FinshesLate,Entrants?filter=Date:30D`;
      log.debug(`[30d] URL: ${path30d}`);

      const raw30d = await getOrFetchSharkScope(
        groupNick.id,
        "stats_30d",
        "?filter=Date:30D",
        () => sharkScopeGet(path30d),
        24
      );

      const rem30 = extractRemainingSearches(raw30d);
      if (rem30 !== null) remainingSearches = rem30;

      try {
        const path90d = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/statistics/AvROI,Count,TotalProfit,AvStake,AvEntrants,FinshesEarly,FinshesLate,Entrants${SHARKSCOPE_STATS_FILTER_90D}`;
        const raw90d = await getOrFetchSharkScope(
          groupNick.id,
          "stats_90d",
          SHARKSCOPE_STATS_FILTER_90D,
          () => sharkScopeGet(path90d),
          24
        );
        const rem90 = extractRemainingSearches(raw90d);
        if (rem90 !== null) remainingSearches = rem90;
      } catch (err) {
        log.warn(
          `[90d] falha ${groupName}`,
          err instanceof Error ? { message: err.message } : { message: ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR }
        );
      }

      const shortStatsBase = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/statistics/AvROI,Count,TotalProfit,AvStake`;
      for (const [label, filterKey] of Object.entries(SHARKSCOPE_TYPE_FILTER_KEY)) {
        try {
          await getOrFetchSharkScope(
            groupNick.id,
            "stats_30d",
            filterKey,
            () => sharkScopeGet(`${shortStatsBase}${filterKey}`),
            24
          );
        } catch (err) {
          log.warn(
            `[tipo ${label}] falha ${groupName}`,
            err instanceof Error ? { message: err.message } : { message: ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR }
          );
        }
      }

      // Calcular alertas (10D)
      const roi10d = extractStat(raw10d, "AvROI");
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
          log.warn(`🚨 [${groupName}] Alerta ROI (10d): ${roi10d}% (${sev})`);
        }
      }

      // Calcular alertas (30D)
      const avgEntrants30d = extractStat(raw30d, "AvEntrants");
      const count30d = extractStat(raw30d, "Count");
      const entrants30d = extractStat(raw30d, "Entrants");
      const earlyFinish30d = extractStat(raw30d, "EarlyFinish");
      const lateFinish30d = extractStat(raw30d, "LateFinish");

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
        const reentryRate = ((entrants30d / count30d) - 1) * 100;
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

      if (earlyFinish30d !== null) {
        const sev = earlyFinishSeverity(earlyFinish30d);
        if (sev === "red" || sev === "yellow") {
           await prisma.alertLog.create({
             data: {
               playerId: player.id,
               alertType: "early_finish",
               severity: sev,
               metricValue: earlyFinish30d,
               threshold: 8,
               context: { groupName, period: "30d" },
             },
           });
           log.warn(`⚠️ [${groupName}] Alerta FP (30d): ${earlyFinish30d}% (${sev})`);
        }
      }

      if (lateFinish30d !== null) {
        const sev = lateFinishSeverity(lateFinish30d);
        if (sev === "red" || sev === "yellow") {
           await prisma.alertLog.create({
             data: {
               playerId: player.id,
               alertType: "late_finish",
               severity: sev,
               metricValue: lateFinish30d,
               threshold: 8,
               context: { groupName, period: "30d" },
             },
           });
           log.warn(`⚠️ [${groupName}] Alerta FT (30d): ${lateFinish30d}% (${sev})`);
        }
      }

      log.info(`✅ [${groupName}] Sincronizado | ROI(10d): ${roi10d ?? '-'} | FP(30d): ${earlyFinish30d ?? '-'} | FT(30d): ${lateFinish30d ?? '-'}`);

      // Sincronização bem sucedida: limpa alertas group_not_found anteriores
      await prisma.alertLog.deleteMany({
        where: { playerId: player.id, alertType: "group_not_found" },
      });

      processed++;
    } catch (err) {
      log.error(
        `Erro ao processar grupo ${groupName} (Jogador: ${player.name})`,
        err instanceof Error ? err : undefined,
        { playerId: player.id, groupName }
      );
      errors++;

      const errorMessage = err instanceof Error ? err.message.toLowerCase() : "";
      if (errorMessage.includes("not found") || errorMessage.includes("opted out")) {
        // Remove alertas antigos antes de criar novo (evita acúmulo)
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
            context: { groupName, message: "Grupo não encontrado no SharkScope" },
          },
        });
        log.warn(`Alerta de group_not_found criado para: ${groupName}`);
      }
    }
  }

  const siteNetworks = Object.keys(POKER_NETWORKS);
  const siteNicks = await prisma.playerNick.findMany({
    where: { isActive: true, network: { in: siteNetworks } },
    select: { id: true, nick: true, network: true },
  });

  log.info(`SharkScope: sincronizando ${siteNicks.length} nicks por rede (analytics Por Site)`);

  for (const pn of siteNicks) {
    try {
      const enc = encodeURIComponent(pn.nick);
      const pathSite30 = `/networks/${pn.network}/players/${enc}/statistics/AvROI,Count,TotalProfit,AvStake,AvEntrants,FinshesEarly,FinshesLate,Entrants?filter=Date:30D`;
      const rawSite30 = await getOrFetchSharkScope(
        pn.id,
        "stats_30d",
        "?filter=Date:30D",
        () => sharkScopeGet(pathSite30),
        24
      );
      const remS30 = extractRemainingSearches(rawSite30);
      if (remS30 !== null) remainingSearches = remS30;

      const pathSite90 = `/networks/${pn.network}/players/${enc}/statistics/AvROI,Count,TotalProfit,AvStake,AvEntrants,FinshesEarly,FinshesLate,Entrants${SHARKSCOPE_STATS_FILTER_90D}`;
      const rawSite90 = await getOrFetchSharkScope(
        pn.id,
        "stats_90d",
        SHARKSCOPE_STATS_FILTER_90D,
        () => sharkScopeGet(pathSite90),
        24
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
