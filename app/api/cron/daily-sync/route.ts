import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sharkScopeGet } from "@/lib/sharkscope";
import { getOrFetchSharkScope } from "@/lib/sharkscope-cache";
import { extractStat, extractRemainingSearches, roiSeverity, reentrySeverity, earlyFinishSeverity, lateFinishSeverity } from "@/lib/sharkscope-parse";
import { createLogger } from "@/lib/logger";

const log = createLogger("cron.daily-sync");

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appName = process.env.SHARKSCOPE_APP_NAME;
  if (!appName || !process.env.SHARKSCOPE_APP_KEY) {
    return NextResponse.json(
      { error: "SharkScope credentials not configured." },
      { status: 503 }
    );
  }

  log.info("Iniciando daily-sync SharkScope");

  const nicks = await prisma.playerNick.findMany({
    where: { isActive: true },
    select: { id: true, nick: true, network: true, playerId: true },
  });

  log.info(`Processando ${nicks.length} nicks ativos`);

  let remainingSearches: number | null = null;
  let processed = 0;
  let errors = 0;

  for (const nick of nicks) {
    try {
      // Fetch stats_10d
      const path10d = `/networks/${nick.network}/players/${encodeURIComponent(nick.nick)}?filter=Date:10D`;
      const raw10d = await getOrFetchSharkScope(
        nick.id,
        "stats_10d",
        "?filter=Date:10D",
        () => sharkScopeGet(path10d),
        24
      );

      const rem = extractRemainingSearches(raw10d);
      if (rem !== null) remainingSearches = rem;

      // Fetch stats_30d (com campos específicos mensais/reentradas)
      const path30d = `/networks/${nick.network}/players/${encodeURIComponent(nick.nick)}/statistics/AvROI,Count,TotalProfit,AvStake,AvEntrants,EarlyFinish,LateFinish,Entrants?filter=Date:30D`;
      const raw30d = await getOrFetchSharkScope(
        nick.id,
        "stats_30d",
        "?filter=Date:30D",
        () => sharkScopeGet(path30d),
        24
      );

      const rem30 = extractRemainingSearches(raw30d);
      if (rem30 !== null) remainingSearches = rem30;

      // Calcular alertas (10D)
      const roi10d = extractStat(raw10d, "AvROI");
      if (roi10d !== null) {
        const sev = roiSeverity(roi10d);
        if (sev === "red" || sev === "yellow") {
          await prisma.alertLog.create({
            data: {
              playerId: nick.playerId,
              alertType: "roi_drop",
              severity: sev,
              metricValue: roi10d,
              threshold: sev === "red" ? -40 : -20,
              context: { nick: nick.nick, network: nick.network, period: "10d" },
            },
          });
          log.warn(`Alerta ROI gerado para nick ${nick.nick}`, { roi10d, severity: sev });
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
            playerId: nick.playerId,
            alertType: "high_variance",
            severity: "yellow",
            metricValue: avgEntrants30d,
            threshold: 1200,
            context: { nick: nick.nick, network: nick.network, period: "30d" },
          },
        });
      }

      // Taxa Reentrada = (Entrants / Count - 1)*100
      // Nota: o SS às vezes chama Entrants de Inscrições totais, se existir a estatística
      if (count30d && count30d > 0 && entrants30d && entrants30d > count30d) {
        const reentryRate = ((entrants30d / count30d) - 1) * 100;
        const sev = reentrySeverity(reentryRate);
        if (sev === "red" || sev === "yellow") {
          await prisma.alertLog.create({
            data: {
              playerId: nick.playerId,
              alertType: "reentry_high",
              severity: sev,
              metricValue: reentryRate,
              threshold: 25,
              context: { nick: nick.nick, network: nick.network, period: "30d", count: count30d, entrants: entrants30d },
            },
          });
        }
      }

      if (earlyFinish30d !== null) {
        const sev = earlyFinishSeverity(earlyFinish30d);
        if (sev === "red" || sev === "yellow") {
          await prisma.alertLog.create({
            data: {
              playerId: nick.playerId,
              alertType: "early_finish",
              severity: sev,
              metricValue: earlyFinish30d,
              threshold: 8,
              context: { nick: nick.nick, network: nick.network, period: "30d" },
            },
          });
        }
      }

      if (lateFinish30d !== null) {
        const sev = lateFinishSeverity(lateFinish30d);
        if (sev === "red" || sev === "yellow") {
          await prisma.alertLog.create({
            data: {
              playerId: nick.playerId,
              alertType: "late_finish",
              severity: sev,
              metricValue: lateFinish30d,
              threshold: 8,
              context: { nick: nick.nick, network: nick.network, period: "30d" },
            },
          });
        }
      }

      processed++;
    } catch (err) {
      log.error(
        `Erro ao processar nick ${nick.nick}`,
        err instanceof Error ? err : undefined,
        { nickId: nick.id }
      );
      errors++;
    }
  }

  log.info("daily-sync concluído", { processed, errors, remainingSearches });

  return NextResponse.json({
    ok: true,
    processed,
    errors,
    remainingSearches,
    ts: new Date().toISOString(),
  });
}
