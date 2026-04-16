import { prisma } from "@/lib/prisma";
import { sharkScopeAppKey, sharkScopeAppName } from "@/lib/constants";
import {
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D,
  SHARKSCOPE_GROUP_SITE_FILTER_KEYS,
} from "@/lib/constants/sharkscope-group-site";
import {
  SHARKSCOPE_STATS_FILTER_10D,
  SHARKSCOPE_STATS_FILTER_30D,
  SHARKSCOPE_STATS_FILTER_90D,
} from "@/lib/constants/sharkscope-type-filters";
import { extractStat, extractRemainingSearches, extractRoiTenDayForPlayerTable } from "@/lib/sharkscope-parse";
import { buildSharkscopeStatMap } from "@/lib/sharkscope-stat-scan";
import { sharkScopeGet } from "@/lib/utils";
import { parseGroupSiteBreakdownPayload } from "@/lib/sharkscope/completed-tournaments-aggregate";
import { collectTournamentNetworkHistogram } from "@/lib/sharkscope/playergroup-network-probe";

const STATS_FIELDS =
  "Entries,Count,TotalROI,AvROI,ITM,TotalProfit,Profit,AvStake,FinshesEarly,FinshesLate,Entrants";

export type SharkscopePlayerDebugSearchLine = {
  label: string;
  path: string;
};

export type SharkscopePlayerDebugApiBlock = {
  live10d: null | {
    TotalROI: number | null;
    AvROI: number | null;
    EarlyFinish: number | null;
    LateFinish: number | null;
    map: Record<string, number>;
  };
  live365d: null | {
    TotalROI: number | null;
    AvROI: number | null;
    EarlyFinish: number | null;
    LateFinish: number | null;
  };
  liveLifetime: null | {
    TotalROI: number | null;
    AvROI: number | null;
    EarlyFinish: number | null;
    LateFinish: number | null;
  };
  ctOnePage: null | {
    path: string;
    histogram: Record<string, number>;
    totalTournamentsCounted: number;
    ok: boolean;
    error?: string;
  };
};

export type SharkscopePlayerDebugResult =
  | { ok: false; error: string }
  | {
      ok: true;
      player: { id: string; name: string; playerGroup: string };
      remainingSearches: number | null;
      /** Chamadas HTTP SharkScope neste request (cada GET = 1 unidade no contador; CT: doc cobra ~1 busca / 100 torneios por resposta). */
      searchCallsThisRequest: number;
      searchLines: SharkscopePlayerDebugSearchLine[];
      /** Chamadas granulares × nº de grupos Shark distintos no banco (estimativa). */
      extrapolateGranularForAllGroups: number;
      groupCountInDb: number;
      note: string;
      cache: {
        stats10d: { expiresAt: string | null; hasData: boolean };
        stats30d: { expiresAt: string | null; hasData: boolean };
        stats90d: { expiresAt: string | null; hasData: boolean };
        statsLifetime: { expiresAt: string | null; hasData: boolean };
        breakdown90d: {
          hasPayload: boolean;
          tournamentRows: number | null;
          oldestDateSec: number | null;
          newestDateSec: number | null;
        };
      };
      tableAsApp: {
        roiTenDay: number | null;
        fpTenDay: number | null;
        ftTenDay: number | null;
      };
      statsFromCache: {
        ten: {
          TotalROI: number | null;
          AvROI: number | null;
          EarlyFinish: number | null;
          LateFinish: number | null;
        } | null;
      };
      api: SharkscopePlayerDebugApiBlock;
    };

function encPath(groupName: string): string {
  return encodeURIComponent(groupName.trim());
}

async function ledgerGet(
  ledger: { calls: number; lines: SharkscopePlayerDebugSearchLine[]; remaining: number | null },
  label: string,
  path: string
): Promise<unknown> {
  ledger.calls++;
  ledger.lines.push({ label, path });
  const data = await sharkScopeGet(path);
  const rem = extractRemainingSearches(data);
  if (rem !== null) ledger.remaining = rem;
  return data;
}

function statsPath(groupName: string, filterSuffix: string): string {
  const enc = encPath(groupName);
  const q = filterSuffix ? `?${filterSuffix.replace(/^\?/, "")}` : "";
  return `/networks/PlayerGroup/players/${enc}/statistics/${STATS_FIELDS}${q}`;
}

async function countDistinctPlayerGroups(): Promise<number> {
  const rows = await prisma.player.groupBy({
    by: ["playerGroup"],
    where: { status: "ACTIVE", playerGroup: { not: null } },
  });
  return rows.length;
}

export async function loadSharkscopePlayerDebug(
  playerId: string,
  opts: {
    api10d: boolean;
    api365d: boolean;
    apiLifetime: boolean;
    apiCtOnePage: boolean;
  }
): Promise<SharkscopePlayerDebugResult> {
  if (!playerId.trim()) {
    return { ok: false, error: "Escolha um jogador." };
  }

  const groupCountInDb = await countDistinctPlayerGroups();

  const player = await prisma.player.findFirst({
    where: { id: playerId.trim(), status: "ACTIVE", playerGroup: { not: null } },
    select: { id: true, name: true, playerGroup: true },
  });

  if (!player?.playerGroup) {
    return { ok: false, error: "Jogador não encontrado ou sem Grupo Shark (playerGroup)." };
  }

  const groupName = player.playerGroup.trim();

  const nick = await prisma.playerNick.findUnique({
    where: {
      playerId_nick_network: {
        playerId: player.id,
        nick: groupName,
        network: "PlayerGroup",
      },
    },
    select: { id: true },
  });

  const [c10, c30, c90, clife, b90] = nick
    ? await Promise.all([
        prisma.sharkScopeCache.findUnique({
          where: {
            playerNickId_dataType_filterKey: {
              playerNickId: nick.id,
              dataType: "stats_10d",
              filterKey: SHARKSCOPE_STATS_FILTER_10D,
            },
          },
          select: { rawData: true, expiresAt: true },
        }),
        prisma.sharkScopeCache.findUnique({
          where: {
            playerNickId_dataType_filterKey: {
              playerNickId: nick.id,
              dataType: "stats_30d",
              filterKey: SHARKSCOPE_STATS_FILTER_30D,
            },
          },
          select: { rawData: true, expiresAt: true },
        }),
        prisma.sharkScopeCache.findUnique({
          where: {
            playerNickId_dataType_filterKey: {
              playerNickId: nick.id,
              dataType: "stats_90d",
              filterKey: SHARKSCOPE_STATS_FILTER_90D,
            },
          },
          select: { rawData: true, expiresAt: true },
        }),
        prisma.sharkScopeCache.findUnique({
          where: {
            playerNickId_dataType_filterKey: {
              playerNickId: nick.id,
              dataType: "stats_lifetime",
              filterKey: "?lifetime",
            },
          },
          select: { rawData: true, expiresAt: true },
        }),
        prisma.sharkScopeCache.findUnique({
          where: {
            playerNickId_dataType_filterKey: {
              playerNickId: nick.id,
              dataType: SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D,
              filterKey: SHARKSCOPE_GROUP_SITE_FILTER_KEYS["90d"],
            },
          },
          select: { rawData: true, expiresAt: true },
        }),
      ])
    : [null, null, null, null, null];

  let roiTenDay: number | null = null;
  let fpTenDay: number | null = null;
  let ftTenDay: number | null = null;
  if (c10?.rawData) {
    roiTenDay = extractRoiTenDayForPlayerTable(c10.rawData);
    fpTenDay = extractStat(c10.rawData, "EarlyFinish");
    ftTenDay = extractStat(c10.rawData, "LateFinish");
  }

  const statsFromCache10 =
    c10?.rawData != null
      ? {
          TotalROI: extractStat(c10.rawData, "TotalROI"),
          AvROI: extractStat(c10.rawData, "AvROI"),
          EarlyFinish: extractStat(c10.rawData, "EarlyFinish"),
          LateFinish: extractStat(c10.rawData, "LateFinish"),
        }
      : null;

  let breakdownMeta: {
    hasPayload: boolean;
    tournamentRows: number | null;
    oldestDateSec: number | null;
    newestDateSec: number | null;
  } = {
    hasPayload: false,
    tournamentRows: null,
    oldestDateSec: null,
    newestDateSec: null,
  };

  if (b90?.rawData) {
    const p = parseGroupSiteBreakdownPayload(b90.rawData);
    if (p && p.v === 3 && Array.isArray(p.tournaments)) {
      breakdownMeta = {
        hasPayload: true,
        tournamentRows: p.tournaments.length,
        oldestDateSec:
          p.tournaments.length > 0 ? Math.min(...p.tournaments.map((t) => t.date)) : null,
        newestDateSec:
          p.tournaments.length > 0 ? Math.max(...p.tournaments.map((t) => t.date)) : null,
      };
    } else if (p) {
      breakdownMeta = { hasPayload: true, tournamentRows: p.tournamentRows ?? null, oldestDateSec: null, newestDateSec: null };
    }
  }

  const ledger = { calls: 0, lines: [] as SharkscopePlayerDebugSearchLine[], remaining: null as number | null };

  const api: SharkscopePlayerDebugApiBlock = {
    live10d: null,
    live365d: null,
    liveLifetime: null,
    ctOnePage: null,
  };

  if (!sharkScopeAppName || !sharkScopeAppKey) {
    return {
      ok: true,
      player: { id: player.id, name: player.name, playerGroup: groupName },
      remainingSearches: null,
      searchCallsThisRequest: 0,
      searchLines: [],
      extrapolateGranularForAllGroups: 0,
      groupCountInDb,
      note: "SHARKSCOPE_APP_NAME / SHARKSCOPE_APP_KEY ausentes — só cache local.",
      cache: {
        stats10d: { expiresAt: c10?.expiresAt?.toISOString() ?? null, hasData: !!c10?.rawData },
        stats30d: { expiresAt: c30?.expiresAt?.toISOString() ?? null, hasData: !!c30?.rawData },
        stats90d: { expiresAt: c90?.expiresAt?.toISOString() ?? null, hasData: !!c90?.rawData },
        statsLifetime: { expiresAt: clife?.expiresAt?.toISOString() ?? null, hasData: !!clife?.rawData },
        breakdown90d: breakdownMeta,
      },
      tableAsApp: { roiTenDay, fpTenDay, ftTenDay },
      statsFromCache: { ten: statsFromCache10 },
      api: { live10d: null, live365d: null, liveLifetime: null, ctOnePage: null },
    };
  }

  const anyApi = opts.api10d || opts.api365d || opts.apiLifetime || opts.apiCtOnePage;

  if (anyApi) {
    try {
      if (opts.api10d) {
        const path = statsPath(groupName, `filter=${encodeURIComponent("Date:10D")}`);
        const raw = await ledgerGet(ledger, "statistics (10d)", path);
        const map = buildSharkscopeStatMap(raw);
        api.live10d = {
          TotalROI: extractStat(raw, "TotalROI"),
          AvROI: extractStat(raw, "AvROI"),
          EarlyFinish: extractStat(raw, "EarlyFinish"),
          LateFinish: extractStat(raw, "LateFinish"),
          map: Object.fromEntries(map),
        };
      }
      if (opts.api365d) {
        const path = statsPath(groupName, `filter=${encodeURIComponent("Date:365D")}`);
        const raw = await ledgerGet(ledger, "statistics (~365d)", path);
        api.live365d = {
          TotalROI: extractStat(raw, "TotalROI"),
          AvROI: extractStat(raw, "AvROI"),
          EarlyFinish: extractStat(raw, "EarlyFinish"),
          LateFinish: extractStat(raw, "LateFinish"),
        };
      }
      if (opts.apiLifetime) {
        const path = statsPath(groupName, "");
        const raw = await ledgerGet(ledger, "statistics (lifetime, sem filtro Date)", path);
        api.liveLifetime = {
          TotalROI: extractStat(raw, "TotalROI"),
          AvROI: extractStat(raw, "AvROI"),
          EarlyFinish: extractStat(raw, "EarlyFinish"),
          LateFinish: extractStat(raw, "LateFinish"),
        };
      }
      if (opts.apiCtOnePage) {
        const enc = encPath(groupName);
        const ctPath = `/networks/PlayerGroup/players/${enc}/completedTournaments?order=Last,1~100&filter=${encodeURIComponent("Date:90D")}`;
        try {
          const ctRaw = await ledgerGet(ledger, "completedTournaments (1 páx, 90d)", ctPath);
          const hist = collectTournamentNetworkHistogram(ctRaw);
          const sorted = [...hist.entries()].sort((a, b) => b[1] - a[1]);
          api.ctOnePage = {
            path: ctPath,
            histogram: Object.fromEntries(sorted),
            totalTournamentsCounted: sorted.reduce((a, [, n]) => a + n, 0),
            ok: true,
          };
        } catch (e) {
          api.ctOnePage = {
            path: ctPath,
            histogram: {},
            totalTournamentsCounted: 0,
            ok: false,
            error: e instanceof Error ? e.message : String(e),
          };
        }
      }
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  const extrapolateGranularForAllGroups = ledger.calls * groupCountInDb;

  return {
    ok: true,
    player: { id: player.id, name: player.name, playerGroup: groupName },
    remainingSearches: ledger.remaining,
    searchCallsThisRequest: ledger.calls,
    searchLines: ledger.lines,
    extrapolateGranularForAllGroups,
    groupCountInDb,
    note:
      "Chamadas granulares: cada linha = 1 GET. Extrapolação = chamadas × grupos no banco. O fluxo do cron/sync manual usa `runDailySyncSharkScope` (veja botão na mesma página). Doc: CT ~1 busca / 100 torneios.",
    cache: {
      stats10d: { expiresAt: c10?.expiresAt?.toISOString() ?? null, hasData: !!c10?.rawData },
      stats30d: { expiresAt: c30?.expiresAt?.toISOString() ?? null, hasData: !!c30?.rawData },
      stats90d: { expiresAt: c90?.expiresAt?.toISOString() ?? null, hasData: !!c90?.rawData },
      statsLifetime: { expiresAt: clife?.expiresAt?.toISOString() ?? null, hasData: !!clife?.rawData },
      breakdown90d: breakdownMeta,
    },
    tableAsApp: { roiTenDay, fpTenDay, ftTenDay },
    statsFromCache: { ten: statsFromCache10 },
    api,
  };
}

export async function listPlayersWithGroupForDebug(): Promise<
  { id: string; name: string; playerGroup: string }[]
> {
  const rows = await prisma.player.findMany({
    where: { status: "ACTIVE", playerGroup: { not: null } },
    select: { id: true, name: true, playerGroup: true },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    playerGroup: r.playerGroup!.trim(),
  }));
}
