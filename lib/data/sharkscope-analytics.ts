import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { extractStat } from "@/lib/sharkscope-parse";
import { POKER_NETWORKS } from "@/lib/sharkscope";
import type { NetworkStat, TierStat, TypeStat, RankingEntry } from "@/lib/types";

async function buildNetworkStats(dataType: string): Promise<NetworkStat[]> {
  const caches = await prisma.sharkScopeCache.findMany({
    where: { dataType, expiresAt: { gt: new Date() } },
    select: {
      rawData: true,
      playerNick: { select: { network: true } },
    },
  });

  const byNetwork = new Map<
    string,
    { rois: number[]; profits: number[]; counts: number[] }
  >();

  for (const cache of caches) {
    const net = cache.playerNick.network;
    if (!byNetwork.has(net)) byNetwork.set(net, { rois: [], profits: [], counts: [] });
    const bucket = byNetwork.get(net)!;
    const roi = extractStat(cache.rawData, "AvROI");
    const profit = extractStat(cache.rawData, "TotalProfit");
    const count = extractStat(cache.rawData, "Count");
    if (roi !== null) bucket.rois.push(roi);
    if (profit !== null) bucket.profits.push(profit);
    if (count !== null) bucket.counts.push(count);
  }

  const avg = (arr: number[]) =>
    arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length;
  const sum = (arr: number[]) =>
    arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0);

  return Object.entries(POKER_NETWORKS).map(([key, val]) => {
    const bucket = byNetwork.get(key);
    return {
      network: key,
      label: val.label,
      roi: bucket ? avg(bucket.rois) : null,
      profit: bucket ? sum(bucket.profits) : null,
      count: bucket ? sum(bucket.counts) : null,
    };
  });
}

function classifyTier(stake: number | null): "Low" | "Mid" | "High" | null {
  if (stake === null) return null;
  if (stake < 15) return "Low";
  if (stake < 50) return "Mid";
  return "High";
}

async function buildTierStats(dataType: string): Promise<TierStat[]> {
  const caches = await prisma.sharkScopeCache.findMany({
    where: { dataType, expiresAt: { gt: new Date() } },
    select: { rawData: true },
  });

  const byTier = new Map<
    "Low" | "Mid" | "High",
    { rois: number[]; profits: number[]; counts: number[]; players: number }
  >([
    ["Low", { rois: [], profits: [], counts: [], players: 0 }],
    ["Mid", { rois: [], profits: [], counts: [], players: 0 }],
    ["High", { rois: [], profits: [], counts: [], players: 0 }],
  ]);

  for (const cache of caches) {
    const stake = extractStat(cache.rawData, "AvStake");
    const tier = classifyTier(stake);
    if (!tier) continue;

    const bucket = byTier.get(tier)!;
    bucket.players++;

    const roi = extractStat(cache.rawData, "AvROI");
    const profit = extractStat(cache.rawData, "TotalProfit");
    const count = extractStat(cache.rawData, "Count");
    if (roi !== null) bucket.rois.push(roi);
    if (profit !== null) bucket.profits.push(profit);
    if (count !== null) bucket.counts.push(count);
  }

  const avg = (arr: number[]) =>
    arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length;
  const sum = (arr: number[]) =>
    arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0);

  return ["Low" as const, "Mid" as const, "High" as const].map((tier) => {
    const bucket = byTier.get(tier)!;
    return {
      tier,
      roi: avg(bucket.rois),
      profit: sum(bucket.profits),
      count: sum(bucket.counts),
      players: bucket.players,
    };
  });
}

async function buildRanking(): Promise<RankingEntry[]> {
  const playerCaches = await prisma.sharkScopeCache.findMany({
    where: { dataType: "stats_30d", expiresAt: { gt: new Date() } },
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

  const rankingMap = new Map<
    string,
    { player: { id: string; name: string; nickname: string | null }; roi: number; count: number }
  >();

  for (const cache of playerCaches) {
    const roi = extractStat(cache.rawData, "AvROI");
    const count = extractStat(cache.rawData, "Count");
    if (roi === null) continue;
    const p = cache.playerNick.player;
    if (!rankingMap.has(p.id)) {
      rankingMap.set(p.id, { player: p, roi, count: count ?? 0 });
    }
  }

  return [...rankingMap.values()].sort((a, b) => b.roi - a.roi);
}

async function loadAnalyticsPayload() {
  const [stats30d, stats90d, ranking, tierStats30d] = await Promise.all([
    buildNetworkStats("stats_30d"),
    buildNetworkStats("stats_90d"),
    buildRanking(),
    buildTierStats("stats_30d"),
  ]);
  // Placeholder para Types no BD que vai requerer breakdowns complexos (Type:Bounty vs Type:Regular)
  // Como o cache do SharkScope não expõe Proporção Bounty vs Não Bounty implicitamente na visão global, 
  // O app vai devolver null para UI gerando o disclaimer.
  const typeStats30d: TypeStat[] = [
    { type: "Bounty", roi: null, profit: null, count: null },
    { type: "Vanilla", roi: null, profit: null, count: null },
  ];
  return { stats30d, stats90d, ranking, tierStats30d, typeStats30d };
}

const cachedSharkscopeAnalytics = unstable_cache(
  loadAnalyticsPayload,
  ["sharkscope-analytics-v2"],
  { revalidate: 60, tags: ["sharkscope-analytics"] }
);

export function getCachedSharkscopeAnalytics() {
  return cachedSharkscopeAnalytics();
}
