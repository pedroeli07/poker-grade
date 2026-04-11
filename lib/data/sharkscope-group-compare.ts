import { prisma } from "@/lib/prisma";
import { sharkScopeAppName, sharkScopeAppKey } from "@/lib/constants";
import { sharkScopeGet } from "@/lib/utils";
import { extractStat, extractRoiTenDayForPlayerTable } from "@/lib/sharkscope-parse";
import { buildSharkscopeStatMap } from "@/lib/sharkscope-stat-scan";

/** Mesmo path de campos que o daily-sync usa para PlayerGroup 10d */
export function sharkscopePlayerGroupStatsPath10d(groupName: string): string {
  const enc = encodeURIComponent(groupName.trim());
  return `/networks/PlayerGroup/players/${enc}/statistics/Entries,Count,TotalROI,AvROI,ITM,TotalProfit,Profit,AvStake,FinshesEarly,FinshesLate?filter=Date:10D`;
}

export type SharkscopeGroupCompareResult =
  | { ok: false; error: string }
  | {
      ok: true;
      groupName: string;
      apiPath10d: string;
      player: { id: string; name: string } | null;
      playerNickId: string | null;
      cache10d: {
        fetchedAt: Date;
        expiresAt: Date;
      } | null;
      cache30d: {
        fetchedAt: Date;
        expiresAt: Date;
      } | null;
      /** Valores brutos do cache 10d (o que a API devolveu por stat) */
      statsFromCache10d: {
        TotalROI: number | null;
        AvROI: number | null;
        EarlyFinish: number | null;
        LateFinish: number | null;
      } | null;
      /** Referência: FP/FT do cache 30d (a tabela de jogadores não usa isto) */
      statsFromCache30d: {
        EarlyFinish: number | null;
        LateFinish: number | null;
      } | null;
      /** Replica `getPlayersTablePayloadForSession`: TotalROI + FP/FT só do stats_10d */
      appTableAsImplemented: {
        roiTenDay: number | null;
        fpTenDay: number | null;
        ftTenDay: number | null;
      };
      /** Busca ao vivo (opcional) */
      live: null | {
        totalRoi: number | null;
        avRoi: number | null;
        earlyFinish: number | null;
        lateFinish: number | null;
        allStatsFromMap: Record<string, number>;
      };
      liveError: string | null;
    };

export async function loadSharkscopeGroupCompare(
  groupNameRaw: string,
  opts: { live: boolean }
): Promise<SharkscopeGroupCompareResult> {
  const groupName = groupNameRaw.trim();
  if (!groupName) {
    return { ok: false, error: "Informe o nome do grupo (playerGroup), ex.: adriano silva cl 2025." };
  }

  const apiPath10d = sharkscopePlayerGroupStatsPath10d(groupName);

  const player = await prisma.player.findFirst({
    where: { playerGroup: groupName },
    select: { id: true, name: true },
  });

  const nick =
    player &&
    (await prisma.playerNick.findUnique({
      where: {
        playerId_nick_network: {
          playerId: player.id,
          nick: groupName,
          network: "PlayerGroup",
        },
      },
      select: { id: true },
    }));

  const cache10d =
    nick &&
    (await prisma.sharkScopeCache.findUnique({
      where: {
        playerNickId_dataType_filterKey: {
          playerNickId: nick.id,
          dataType: "stats_10d",
          filterKey: "?filter=Date:10D",
        },
      },
      select: { rawData: true, fetchedAt: true, expiresAt: true },
    }));

  const cache30d =
    nick &&
    (await prisma.sharkScopeCache.findUnique({
      where: {
        playerNickId_dataType_filterKey: {
          playerNickId: nick.id,
          dataType: "stats_30d",
          filterKey: "?filter=Date:30D",
        },
      },
      select: { rawData: true, fetchedAt: true, expiresAt: true },
    }));

  let roiTenDay: number | null = null;
  let fpTenDay: number | null = null;
  let ftTenDay: number | null = null;

  if (cache10d?.rawData) {
    roiTenDay = extractRoiTenDayForPlayerTable(cache10d.rawData);
    fpTenDay = extractStat(cache10d.rawData, "EarlyFinish");
    ftTenDay = extractStat(cache10d.rawData, "LateFinish");
  }

  const statsFromCache10d =
    cache10d?.rawData != null
      ? {
          TotalROI: extractStat(cache10d.rawData, "TotalROI"),
          AvROI: extractStat(cache10d.rawData, "AvROI"),
          EarlyFinish: extractStat(cache10d.rawData, "EarlyFinish"),
          LateFinish: extractStat(cache10d.rawData, "LateFinish"),
        }
      : null;

  const statsFromCache30d =
    cache30d?.rawData != null
      ? {
          EarlyFinish: extractStat(cache30d.rawData, "EarlyFinish"),
          LateFinish: extractStat(cache30d.rawData, "LateFinish"),
        }
      : null;

  let live: {
    totalRoi: number | null;
    avRoi: number | null;
    earlyFinish: number | null;
    lateFinish: number | null;
    allStatsFromMap: Record<string, number>;
  } | null = null;
  let liveError: string | null = null;

  if (opts.live) {
    if (!sharkScopeAppName || !sharkScopeAppKey) {
      liveError = "Credenciais SharkScope (app name / key) não configuradas.";
    } else {
      try {
        const liveRaw = await sharkScopeGet(apiPath10d);
        const statMap = buildSharkscopeStatMap(liveRaw);
        const allStatsFromMap = Object.fromEntries(statMap);
        live = {
          totalRoi: extractStat(liveRaw, "TotalROI"),
          avRoi: extractStat(liveRaw, "AvROI"),
          earlyFinish: extractStat(liveRaw, "EarlyFinish"),
          lateFinish: extractStat(liveRaw, "LateFinish"),
          allStatsFromMap,
        };
      } catch (e) {
        liveError = e instanceof Error ? e.message : String(e);
      }
    }
  }

  return {
    ok: true,
    groupName,
    apiPath10d,
    player,
    playerNickId: nick?.id ?? null,
    cache10d: cache10d
      ? { fetchedAt: cache10d.fetchedAt, expiresAt: cache10d.expiresAt }
      : null,
    cache30d: cache30d
      ? { fetchedAt: cache30d.fetchedAt, expiresAt: cache30d.expiresAt }
      : null,
    statsFromCache10d,
    statsFromCache30d,
    appTableAsImplemented: {
      roiTenDay,
      fpTenDay,
      ftTenDay,
    },
    live,
    liveError,
  };
}
