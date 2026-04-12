import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { extractStat } from "@/lib/sharkscope-parse";
import { POKER_NETWORKS } from "@/lib/constants";
import {
  SHARKSCOPE_STATS_FILTER_30D,
  SHARKSCOPE_STATS_FILTER_90D,
  SHARKSCOPE_TYPE_BREAKDOWN_KEYS,
} from "@/lib/constants/sharkscope-type-filters";
import {
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D,
  sharkscopeAnalyticsSiteFallbackNicks,
} from "@/lib/constants/sharkscope-group-site";
import {
  emptyNetworkAggBucket,
  parseGroupSiteBreakdownPayload,
  pctFromRatio,
  roiFromAgg,
  sharkscopeNetworkToAppKey,
  type GroupSiteBreakdownPayload,
  type NetworkAggBucket,
} from "@/lib/sharkscope/completed-tournaments-aggregate";
import type { NetworkStat, SiteAnalyticsPayload, TierStat, TypeStat, RankingEntry } from "@/lib/types";
import { classifyTier } from "@/lib/utils";

const SHARKSCOPE_SITE_NETWORKS = Object.keys(POKER_NETWORKS) as string[];

type AggBucket = {
  rois: number[];
  profits: number[];
  counts: number[];
  roiCountPairs: { roi: number; count: number }[];
};

function emptyBucket(): AggBucket {
  return { rois: [], profits: [], counts: [], roiCountPairs: [] };
}

function networkLabel(network: string): string {
  const entry = POKER_NETWORKS[network as keyof typeof POKER_NETWORKS];
  return entry?.label ?? network;
}

const avg = (arr: number[]) =>
  arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length;
const sum = (arr: number[]) =>
  arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0);

function weightedRoi(pairs: { roi: number; count: number }[]): number | null {
  const tw = pairs.reduce((a, p) => a + p.roi * p.count, 0);
  const tc = pairs.reduce((a, p) => a + p.count, 0);
  return tc > 0 ? tw / tc : null;
}

function bucketToNetworkStat(network: string, bucket: AggBucket): NetworkStat {
  return {
    network,
    label: networkLabel(network),
    roi: avg(bucket.rois),
    roiWeighted: weightedRoi(bucket.roiCountPairs),
    profit: sum(bucket.profits),
    count: sum(bucket.counts),
  };
}

function networkStatFromTournamentBucket(network: string, bucket: NetworkAggBucket): NetworkStat {
  const roi = roiFromAgg(bucket);
  return {
    network,
    label: networkLabel(network),
    roi,
    roiWeighted: roi,
    profit: bucket.profit,
    count: bucket.entries,
    stake: bucket.stake,
    itm: pctFromRatio(bucket.itmHits, bucket.entries),
    earlyFinish: pctFromRatio(bucket.earlyHits, bucket.entries),
    lateFinish: pctFromRatio(bucket.lateHits, bucket.entries),
  };
}

function pushCacheIntoBucket(bucket: AggBucket, rawData: unknown) {
  const totalRoi = extractStat(rawData, "TotalROI");
  const profit = extractStat(rawData, "TotalProfit");
  const count = extractStat(rawData, "Count");
  const entries = extractStat(rawData, "Entries");
  const weightForRoi =
    entries !== null && entries > 0 ? entries : count !== null && count > 0 ? count : null;
  if (totalRoi !== null) bucket.rois.push(totalRoi);
  if (profit !== null) bucket.profits.push(profit);
  if (count !== null) bucket.counts.push(count);
  if (totalRoi !== null && weightForRoi !== null) {
    bucket.roiCountPairs.push({ roi: totalRoi, count: weightForRoi });
  }
}

async function buildNetworkStatsFromGroupBreakdown(
  breakdownDataType: string,
  filterKey: string
): Promise<NetworkStat[]> {
  const caches = await prisma.sharkScopeCache.findMany({
    where: {
      dataType: breakdownDataType,
      filterKey,
      expiresAt: { gt: new Date() },
      playerNick: { network: "PlayerGroup" },
    },
    select: { rawData: true },
  });

  const merged = new Map<string, NetworkAggBucket>();
  const seenGroups = new Set<string>();

  for (const c of caches) {
    const payload = parseGroupSiteBreakdownPayload(c.rawData);
    if (!payload) continue;
    const gk = payload.groupName.trim().toLowerCase();
    if (seenGroups.has(gk)) continue;
    seenGroups.add(gk);

    for (const [net, b] of Object.entries(payload.byNetwork)) {
      const netKey = sharkscopeNetworkToAppKey(net) ?? net;
      const cur = merged.get(netKey) ?? emptyNetworkAggBucket();
      merged.set(netKey, {
        profit: cur.profit + b.profit,
        stake: cur.stake + b.stake,
        entries: cur.entries + b.entries,
        itmHits: cur.itmHits + b.itmHits,
        earlyHits: cur.earlyHits + b.earlyHits,
        lateHits: cur.lateHits + b.lateHits,
      });
    }
  }

  return [...merged.entries()]
    .map(([network, bucket]) => networkStatFromTournamentBucket(network, bucket))
    .filter((s) => s.roi !== null || s.profit !== null || (s.count !== null && s.count > 0))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

/** Fallback: caches por nick×rede (legado). */
async function buildNetworkStatsFromNickCaches(dataType: string): Promise<NetworkStat[]> {
  const caches = await prisma.sharkScopeCache.findMany({
    where: {
      dataType,
      expiresAt: { gt: new Date() },
      playerNick: { network: { in: SHARKSCOPE_SITE_NETWORKS } },
    },
    select: {
      rawData: true,
      playerNick: { select: { network: true } },
    },
  });

  const byNetwork = new Map<string, AggBucket>();

  for (const cache of caches) {
    const net = cache.playerNick.network;
    if (!byNetwork.has(net)) byNetwork.set(net, emptyBucket());
    pushCacheIntoBucket(byNetwork.get(net)!, cache.rawData);
  }

  return [...byNetwork.entries()]
    .map(([network, bucket]) => {
      const s = bucketToNetworkStat(network, bucket);
      return {
        ...s,
        stake: 0,
        itm: null,
        earlyFinish: null,
        lateFinish: null,
      };
    })
    .filter((s) => s.roi !== null || s.profit !== null || s.count !== null)
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

async function buildNetworkStatsForPeriod(period: "30d" | "90d"): Promise<NetworkStat[]> {
  const breakdownType =
    period === "30d" ? SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D : SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D;
  const filterKey = period === "30d" ? SHARKSCOPE_STATS_FILTER_30D : SHARKSCOPE_STATS_FILTER_90D;

  const fromGroup = await buildNetworkStatsFromGroupBreakdown(breakdownType, filterKey);
  if (fromGroup.length > 0) return fromGroup;
  if (sharkscopeAnalyticsSiteFallbackNicks()) {
    return buildNetworkStatsFromNickCaches(period === "30d" ? "stats_30d" : "stats_90d");
  }
  return [];
}

async function buildSiteAnalyticsExtras(period: "30d" | "90d"): Promise<SiteAnalyticsPayload> {
  const breakdownType =
    period === "30d" ? SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D : SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D;
  const filterKey = period === "30d" ? SHARKSCOPE_STATS_FILTER_30D : SHARKSCOPE_STATS_FILTER_90D;

  const caches = await prisma.sharkScopeCache.findMany({
    where: {
      dataType: breakdownType,
      filterKey,
      expiresAt: { gt: new Date() },
      playerNick: { network: "PlayerGroup" },
    },
    select: { rawData: true },
  });

  const seenGroups = new Set<string>();
  const groupPayloads: GroupSiteBreakdownPayload[] = [];

  for (const c of caches) {
    const payload = parseGroupSiteBreakdownPayload(c.rawData);
    if (!payload) continue;
    const gk = payload.groupName.trim().toLowerCase();
    if (seenGroups.has(gk)) continue;
    seenGroups.add(gk);
    groupPayloads.push(payload);
  }

  const hasPerPlayerBreakdown = groupPayloads.some(
    (p) => p.v === 2 && p.byPlayerNick && Object.keys(p.byPlayerNick).length > 0
  );

  const dbPlayers = await prisma.player.findMany({
    where: { status: "ACTIVE", playerGroup: { not: null } },
    select: {
      id: true,
      name: true,
      playerGroup: true,
      nicks: { where: { isActive: true }, select: { nick: true } },
    },
  });

  const eligiblePlayerIds = dbPlayers.map((p) => p.id);
  const groupNotFoundIds = new Set(
    eligiblePlayerIds.length === 0
      ? []
      : (
          await prisma.alertLog.findMany({
            where: {
              playerId: { in: eligiblePlayerIds },
              alertType: "group_not_found",
              acknowledged: false,
            },
            select: { playerId: true },
            distinct: ["playerId"],
          })
        ).map((a) => a.playerId)
  );

  const byPlayerId: Record<string, NetworkStat[]> = {};

  for (const pl of dbPlayers) {
    const gName = pl.playerGroup!.trim().toLowerCase();
    const payload = groupPayloads.find((p) => p.groupName.trim().toLowerCase() === gName);
    if (!payload?.byPlayerNick) continue;

    const nickKeys = new Set<string>([
      pl.name.trim().toLowerCase(),
      ...pl.nicks.map((n) => n.nick.trim().toLowerCase()),
    ]);

    const merged = new Map<string, NetworkAggBucket>();

    for (const [sharkKey, netRec] of Object.entries(payload.byPlayerNick)) {
      if (!nickKeys.has(sharkKey)) continue;
      for (const [net, b] of Object.entries(netRec)) {
        const netKey = sharkscopeNetworkToAppKey(net) ?? net;
        const cur = merged.get(netKey) ?? emptyNetworkAggBucket();
        merged.set(netKey, {
          profit: cur.profit + b.profit,
          stake: cur.stake + b.stake,
          entries: cur.entries + b.entries,
          itmHits: cur.itmHits + b.itmHits,
          earlyHits: cur.earlyHits + b.earlyHits,
          lateHits: cur.lateHits + b.lateHits,
        });
      }
    }

    if (merged.size > 0) {
      byPlayerId[pl.id] = [...merged.entries()]
        .map(([net, b]) => networkStatFromTournamentBucket(net, b))
        .filter((s) => s.roi !== null || s.profit !== null || (s.count !== null && s.count > 0))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    }
  }

  /** Todos com grupo Shark cadastrado, exceto alerta ativo `group_not_found` (igual à tabela de jogadores). */
  const playersWithSiteData = dbPlayers
    .filter((p) => !groupNotFoundIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return {
    playersWithSiteData,
    byPlayerId,
    hasPerPlayerBreakdown,
  };
}

async function buildTierStats(dataType: string): Promise<TierStat[]> {
  const caches = await prisma.sharkScopeCache.findMany({
    where: {
      dataType,
      expiresAt: { gt: new Date() },
      playerNick: { network: "PlayerGroup" },
    },
    select: { rawData: true, playerNick: { select: { nick: true } } },
  });

  const byTier = new Map<
    "Low" | "Mid" | "High",
    AggBucket & { players: number }
  >([
    ["Low", { ...emptyBucket(), players: 0 }],
    ["Mid", { ...emptyBucket(), players: 0 }],
    ["High", { ...emptyBucket(), players: 0 }],
  ]);

  const seenPlayerGroupNames = new Set<string>();

  for (const cache of caches) {
    const gk = cache.playerNick.nick.trim().toLowerCase();
    if (seenPlayerGroupNames.has(gk)) continue;
    seenPlayerGroupNames.add(gk);

    const stake = extractStat(cache.rawData, "AvStake");
    const tier = classifyTier(stake);
    if (!tier) continue;

    const bucket = byTier.get(tier)!;
    bucket.players++;
    pushCacheIntoBucket(bucket, cache.rawData);
  }

  return (["Low", "Mid", "High"] as const).map((tier) => {
    const bucket = byTier.get(tier)!;
    return {
      tier,
      roi: avg(bucket.rois),
      roiWeighted: weightedRoi(bucket.roiCountPairs),
      profit: sum(bucket.profits),
      count: sum(bucket.counts),
      players: bucket.players,
    };
  });
}

async function buildRanking(dataType: "stats_30d" | "stats_90d"): Promise<RankingEntry[]> {
  const filterKey = dataType === "stats_30d" ? SHARKSCOPE_STATS_FILTER_30D : SHARKSCOPE_STATS_FILTER_90D;

  const playerCaches = await prisma.sharkScopeCache.findMany({
    where: {
      dataType,
      filterKey,
      expiresAt: { gt: new Date() },
      playerNick: { network: "PlayerGroup" },
    },
    select: {
      rawData: true,
      playerNick: {
        select: {
          network: true,
          nick: true,
          player: { select: { id: true, name: true, nickname: true } },
        },
      },
    },
  });

  const rankingMap = new Map<string, RankingEntry>();

  for (const cache of playerCaches) {
    const raw = cache.rawData;
    const roi = extractStat(raw, "TotalROI");
    if (roi === null) continue;
    const p = cache.playerNick.player;
    if (rankingMap.has(p.id)) continue;

    rankingMap.set(p.id, {
      player: p,
      roi,
      entries: extractStat(raw, "Entries"),
      profit: extractStat(raw, "TotalProfit"),
      itm: extractStat(raw, "ITM"),
      ability: extractStat(raw, "Ability"),
      avStake: extractStat(raw, "AvStake"),
      earlyFinish: extractStat(raw, "EarlyFinish"),
      lateFinish: extractStat(raw, "LateFinish"),
    });
  }

  return [...rankingMap.values()].sort((a, b) => b.roi - a.roi);
}

async function buildTypeStats30d(): Promise<TypeStat[]> {
  const rows: TypeStat[] = [];

  for (const { type, filterKey } of SHARKSCOPE_TYPE_BREAKDOWN_KEYS) {
    const caches = await prisma.sharkScopeCache.findMany({
      where: {
        dataType: "stats_30d",
        filterKey,
        expiresAt: { gt: new Date() },
      },
      select: { rawData: true },
    });

    const bucket = emptyBucket();
    for (const c of caches) {
      pushCacheIntoBucket(bucket, c.rawData);
    }

    rows.push({
      type,
      roi: avg(bucket.rois),
      roiWeighted: weightedRoi(bucket.roiCountPairs),
      profit: sum(bucket.profits),
      count: sum(bucket.counts),
    });
  }

  return rows;
}

async function loadAnalyticsPayload() {
  const [
    stats30d,
    stats90d,
    siteAnalytics30d,
    siteAnalytics90d,
    ranking30d,
    ranking90d,
    tierStats30d,
    tierStats90d,
    typeStats30d,
  ] = await Promise.all([
    buildNetworkStatsForPeriod("30d"),
    buildNetworkStatsForPeriod("90d"),
    buildSiteAnalyticsExtras("30d"),
    buildSiteAnalyticsExtras("90d"),
    buildRanking("stats_30d"),
    buildRanking("stats_90d"),
    buildTierStats("stats_30d"),
    buildTierStats("stats_90d"),
    buildTypeStats30d(),
  ]);

  return {
    stats30d,
    stats90d,
    siteAnalytics30d,
    siteAnalytics90d,
    ranking30d,
    ranking90d,
    tierStats30d,
    tierStats90d,
    typeStats30d,
  };
}

const cachedSharkscopeAnalytics = unstable_cache(
  loadAnalyticsPayload,
  ["sharkscope-analytics-v15"],
  { revalidate: 60, tags: ["sharkscope-analytics"] }
);

export function getCachedSharkscopeAnalytics() {
  return cachedSharkscopeAnalytics();
}
