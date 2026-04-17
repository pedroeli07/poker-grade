import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { extractStat } from "@/lib/sharkscope-parse";
import { POKER_NETWORKS } from "@/lib/constants";
import {
  SHARKSCOPE_STATS_FILTER_30D,
  SHARKSCOPE_STATS_FILTER_90D,
  SHARKSCOPE_TYPE_BREAKDOWN_KEYS,
  SHARKSCOPE_TYPE_BREAKDOWN_KEYS_90D,
} from "@/lib/constants/sharkscope-type-filters";
import {
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D,
  sharkscopeAnalyticsSiteByNick,
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
import type {
  NetworkStat,
  RankingEntry,
  SiteAnalyticsPayload,
  StakeTierKey,
  TierStat,
  TypeStat,
} from "@/lib/types";
import { sharkscopeStatsHasData } from "@/lib/utils";
import {
  classifyStakeTier,
  STAKE_TIER_LABEL_PT,
  STAKE_TIER_ORDER,
} from "@/lib/constants/sharkscope/analytics";

const SHARKSCOPE_SITE_NETWORKS = Object.keys(POKER_NETWORKS) as string[];

type AggBucket = {
  rois: number[];
  profits: number[];
  /** Soma parcial por cache (Entries ou Count) para total de inscrições. */
  counts: number[];
  roiEntryPairs: { roi: number; entries: number }[];
  itmWeighted: { v: number; w: number }[];
  abilityWeighted: { v: number; w: number }[];
  avStakeWeighted: { v: number; w: number }[];
  earlyWeighted: { v: number; w: number }[];
  lateWeighted: { v: number; w: number }[];
};

function emptyBucket(): AggBucket {
  return {
    rois: [],
    profits: [],
    counts: [],
    roiEntryPairs: [],
    itmWeighted: [],
    abilityWeighted: [],
    avStakeWeighted: [],
    earlyWeighted: [],
    lateWeighted: [],
  };
}

function networkLabel(network: string): string {
  const entry = POKER_NETWORKS[network as keyof typeof POKER_NETWORKS];
  return entry?.label ?? network;
}

const avg = (arr: number[]) =>
  arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length;
const sum = (arr: number[]) =>
  arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0);

function weightedRoi(pairs: { roi: number; entries: number }[]): number | null {
  const tw = pairs.reduce((a, p) => a + p.roi * p.entries, 0);
  const tc = pairs.reduce((a, p) => a + p.entries, 0);
  return tc > 0 ? tw / tc : null;
}

function weightedAvgPairs(pairs: { v: number; w: number }[]): number | null {
  const tw = pairs.reduce((a, p) => a + p.w, 0);
  if (tw <= 0) return null;
  return pairs.reduce((a, p) => a + p.v * p.w, 0) / tw;
}

function bucketToNetworkStat(network: string, bucket: AggBucket): NetworkStat {
  const roiW = weightedRoi(bucket.roiEntryPairs);
  return {
    network,
    label: networkLabel(network),
    roi: roiW ?? avg(bucket.rois),
    roiWeighted: roiW,
    profit: sum(bucket.profits),
    entries: sum(bucket.counts),
  };
}

function bucketToNetworkStatFromNick(network: string, bucket: AggBucket): NetworkStat {
  const base = bucketToNetworkStat(network, bucket);
  return {
    ...base,
    stake: 0,
    itm: weightedAvgPairs(bucket.itmWeighted),
    ability: weightedAvgPairs(bucket.abilityWeighted),
    avStake: weightedAvgPairs(bucket.avStakeWeighted),
    earlyFinish: weightedAvgPairs(bucket.earlyWeighted),
    lateFinish: weightedAvgPairs(bucket.lateWeighted),
  };
}

function networkStatFromTournamentBucket(network: string, bucket: NetworkAggBucket): NetworkStat {
  const roi = roiFromAgg(bucket);
  const entries = bucket.entries;
  return {
    network,
    label: networkLabel(network),
    roi,
    roiWeighted: roi,
    profit: bucket.profit,
    entries,
    stake: bucket.stake,
    itm: pctFromRatio(bucket.itmHits, entries),
    ability: null,
    avStake: entries > 0 ? bucket.stake / entries : null,
    earlyFinish: pctFromRatio(bucket.earlyHits, entries),
    lateFinish: pctFromRatio(bucket.lateHits, entries),
  };
}

function pushCacheIntoBucket(bucket: AggBucket, rawData: unknown) {
  const totalRoi = extractStat(rawData, "TotalROI");
  const profit = extractStat(rawData, "TotalProfit");
  const count = extractStat(rawData, "Count");
  const entries = extractStat(rawData, "Entries");
  const weightForRoi =
    entries !== null && entries > 0 ? entries : count !== null && count > 0 ? count : null;
  /** Coluna "Linhas (entradas)" = Inscrições SharkScope; Contagem só se Entries não vier. */
  const linesForDisplay =
    entries !== null && entries > 0 ? entries : count !== null && count > 0 ? count : null;
  if (totalRoi !== null) bucket.rois.push(totalRoi);
  if (profit !== null) bucket.profits.push(profit);
  if (linesForDisplay !== null) bucket.counts.push(linesForDisplay);
  if (totalRoi !== null && weightForRoi !== null) {
    bucket.roiEntryPairs.push({ roi: totalRoi, entries: weightForRoi });
  }
}

function pushNickCacheIntoBucket(bucket: AggBucket, rawData: unknown) {
  pushCacheIntoBucket(bucket, rawData);
  const entries = extractStat(rawData, "Entries");
  const count = extractStat(rawData, "Count");
  const weight =
    entries !== null && entries > 0 ? entries : count !== null && count > 0 ? count : null;
  if (weight === null) return;
  const itm = extractStat(rawData, "ITM");
  const ability = extractStat(rawData, "Ability");
  const avStake = extractStat(rawData, "AvStake");
  const early = extractStat(rawData, "EarlyFinish");
  const late = extractStat(rawData, "LateFinish");
  if (itm !== null) bucket.itmWeighted.push({ v: itm, w: weight });
  if (ability !== null) bucket.abilityWeighted.push({ v: ability, w: weight });
  if (avStake !== null) bucket.avStakeWeighted.push({ v: avStake, w: weight });
  if (early !== null) bucket.earlyWeighted.push({ v: early, w: weight });
  if (late !== null) bucket.lateWeighted.push({ v: late, w: weight });
}

function bucketToTierStat(
  tier: StakeTierKey,
  label: string,
  bucket: AggBucket,
  players: number
): TierStat {
  const roiW = weightedRoi(bucket.roiEntryPairs);
  return {
    tier,
    label,
    roi: roiW ?? avg(bucket.rois),
    roiWeighted: roiW,
    profit: sum(bucket.profits),
    entries: sum(bucket.counts),
    players,
    itm: weightedAvgPairs(bucket.itmWeighted),
    ability: weightedAvgPairs(bucket.abilityWeighted),
    avStake: weightedAvgPairs(bucket.avStakeWeighted),
    earlyFinish: weightedAvgPairs(bucket.earlyWeighted),
    lateFinish: weightedAvgPairs(bucket.lateWeighted),
  };
}

async function buildNetworkStatsFromGroupBreakdown(
  breakdownDataType: string,
  filterKey: string,
  singlePlayerId?: string
): Promise<NetworkStat[]> {
  const caches = await prisma.sharkScopeCache.findMany({
    where: {
      dataType: breakdownDataType,
      filterKey,
      expiresAt: { gt: new Date() },
      playerNick: {
        network: "PlayerGroup",
        ...(singlePlayerId ? { playerId: singlePlayerId } : {}),
      },
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

    for (const [net, b] of Object.entries(payload.byNetwork) as [string, NetworkAggBucket][]) {
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
    .filter((s) => s.roi !== null || s.profit !== null || (s.entries !== null && s.entries > 0))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

/** Fallback: caches por nick×rede (legado). */
async function buildNetworkStatsFromNickCaches(
  dataType: string,
  singlePlayerId?: string
): Promise<NetworkStat[]> {
  const filterKey =
    dataType === "stats_30d"
      ? SHARKSCOPE_STATS_FILTER_30D
      : dataType === "stats_90d"
        ? SHARKSCOPE_STATS_FILTER_90D
        : null;
  const caches = await prisma.sharkScopeCache.findMany({
    where: {
      dataType,
      ...(filterKey ? { filterKey } : {}),
      expiresAt: { gt: new Date() },
      playerNick: {
        network: { in: SHARKSCOPE_SITE_NETWORKS },
        ...(singlePlayerId ? { playerId: singlePlayerId } : {}),
      },
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
    pushNickCacheIntoBucket(byNetwork.get(net)!, cache.rawData);
  }

  return [...byNetwork.entries()]
    .map(([network, bucket]) => bucketToNetworkStatFromNick(network, bucket))
    .filter((s) => s.roi !== null || s.profit !== null || s.entries !== null)
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

async function buildNetworkStatsForPeriod(
  period: "30d" | "90d",
  singlePlayerId?: string
): Promise<NetworkStat[]> {
  const breakdownType =
    period === "30d" ? SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D : SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D;
  const filterKey = period === "30d" ? SHARKSCOPE_STATS_FILTER_30D : SHARKSCOPE_STATS_FILTER_90D;
  const dataType = period === "30d" ? "stats_30d" : "stats_90d";

  if (sharkscopeAnalyticsSiteByNick()) {
    const fromNick = await buildNetworkStatsFromNickCaches(dataType, singlePlayerId);
    if (fromNick.length > 0) return fromNick;
  }

  const fromGroup = await buildNetworkStatsFromGroupBreakdown(breakdownType, filterKey, singlePlayerId);
  if (fromGroup.length > 0) return fromGroup;
  if (sharkscopeAnalyticsSiteFallbackNicks()) {
    return buildNetworkStatsFromNickCaches(dataType, singlePlayerId);
  }
  return [];
}

async function buildSiteAnalyticsExtras(
  period: "30d" | "90d",
  singlePlayerId?: string
): Promise<SiteAnalyticsPayload> {
  const breakdownType =
    period === "30d" ? SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D : SHARKSCOPE_GROUP_SITE_BREAKDOWN_90D;
  const filterKey = period === "30d" ? SHARKSCOPE_STATS_FILTER_30D : SHARKSCOPE_STATS_FILTER_90D;

  const caches = await prisma.sharkScopeCache.findMany({
    where: {
      dataType: breakdownType,
      filterKey,
      expiresAt: { gt: new Date() },
      playerNick: {
        network: "PlayerGroup",
        ...(singlePlayerId ? { playerId: singlePlayerId } : {}),
      },
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

  /** v2/v3 em `group_site_breakdown_*` trazem `byPlayerNick`; v1 não. O sync atual grava v3. */
  let hasPerPlayerBreakdown = groupPayloads.some(
    (p) => Boolean(p.byPlayerNick && Object.keys(p.byPlayerNick).length > 0)
  );

  const dbPlayers = await prisma.player.findMany({
    where: {
      status: "ACTIVE",
      playerGroup: { not: null },
      ...(singlePlayerId ? { id: singlePlayerId } : {}),
    },
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

  /** Com analytics por nick, `stats_*` por rede vêm de `statistics` — não misturar com CT `byPlayerNick` (grupo/torneios). */
  if (!sharkscopeAnalyticsSiteByNick()) {
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
          .filter((s) => s.roi !== null || s.profit !== null || (s.entries !== null && s.entries > 0))
          .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
      }
    }
  }

  if (sharkscopeAnalyticsSiteByNick()) {
    const dataType = period === "30d" ? "stats_30d" : "stats_90d";
    for (const pl of dbPlayers) {
      const fromNick = await buildNetworkStatsFromNickCaches(dataType, pl.id);
      if (fromNick.length > 0) {
        byPlayerId[pl.id] = fromNick;
        hasPerPlayerBreakdown = true;
      }
    }
  } else if (sharkscopeAnalyticsSiteFallbackNicks()) {
    const dataType = period === "30d" ? "stats_30d" : "stats_90d";
    for (const pl of dbPlayers) {
      if (byPlayerId[pl.id]?.length) continue;
      const fromNick = await buildNetworkStatsFromNickCaches(dataType, pl.id);
      if (fromNick.length > 0) {
        byPlayerId[pl.id] = fromNick;
        hasPerPlayerBreakdown = true;
      }
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

async function buildTierStats(dataType: string, singlePlayerId?: string): Promise<TierStat[]> {
  const filterKey =
    dataType === "stats_30d" ? SHARKSCOPE_STATS_FILTER_30D : SHARKSCOPE_STATS_FILTER_90D;

  const caches = await prisma.sharkScopeCache.findMany({
    where: {
      dataType,
      filterKey,
      expiresAt: { gt: new Date() },
      playerNick: {
        network: "PlayerGroup",
        ...(singlePlayerId ? { playerId: singlePlayerId } : {}),
      },
    },
    select: { rawData: true, playerNick: { select: { nick: true } } },
  });

  const byTier = new Map<StakeTierKey, AggBucket & { players: number }>();
  for (const k of STAKE_TIER_ORDER) {
    byTier.set(k, { ...emptyBucket(), players: 0 });
  }

  const seenPlayerGroupNames = new Set<string>();

  for (const cache of caches) {
    const gk = cache.playerNick.nick.trim().toLowerCase();
    if (seenPlayerGroupNames.has(gk)) continue;
    seenPlayerGroupNames.add(gk);

    const stake = extractStat(cache.rawData, "AvStake");
    const tier = classifyStakeTier(stake);
    if (!tier) continue;

    const bucket = byTier.get(tier)!;
    bucket.players++;
    pushNickCacheIntoBucket(bucket, cache.rawData);
  }

  return STAKE_TIER_ORDER.map((tier) => {
    const bucket = byTier.get(tier)!;
    return bucketToTierStat(tier, STAKE_TIER_LABEL_PT[tier], bucket, bucket.players);
  });
}

async function buildRanking(
  dataType: "stats_30d" | "stats_90d",
  singlePlayerId?: string
): Promise<RankingEntry[]> {
  const filterKey = dataType === "stats_30d" ? SHARKSCOPE_STATS_FILTER_30D : SHARKSCOPE_STATS_FILTER_90D;

  const playerCaches = await prisma.sharkScopeCache.findMany({
    where: {
      dataType,
      filterKey,
      expiresAt: { gt: new Date() },
      playerNick: {
        network: "PlayerGroup",
        ...(singlePlayerId ? { playerId: singlePlayerId } : {}),
      },
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

/**
 * Agrega caches `stats_30d` por filtro de tipo (vários jogadores).
 * **ROI total**: média simples dos `TotalROI` de cada cache (um por jogador) — mesma estatística que o ranking, linha a linha.
 * Lucro somado; ITM / FP / FT / stake / capacidade: médias ponderadas por Entries onde faz sentido.
 */
function aggregateTypeStatsFromCaches(caches: { rawData: unknown }[]): Omit<TypeStat, "type"> {
  let sumEntries = 0;
  let sumProfit = 0;
  let profitHits = 0;
  let sumItmW = 0;
  let sumAbilityW = 0;
  let sumStakeW = 0;
  let sumEarlyW = 0;
  let sumLateW = 0;
  let itmDenom = 0;
  let abilityDenom = 0;
  let stakeDenom = 0;
  let earlyDenom = 0;
  let lateDenom = 0;
  const rois: number[] = [];

  for (const c of caches) {
    const raw = c.rawData;
    const roi = extractStat(raw, "TotalROI");
    const entries = extractStat(raw, "Entries");
    const count = extractStat(raw, "Count");
    const profit = extractStat(raw, "TotalProfit");
    const itm = extractStat(raw, "ITM");
    const ability = extractStat(raw, "Ability");
    const avStake = extractStat(raw, "AvStake");
    const early = extractStat(raw, "EarlyFinish");
    const late = extractStat(raw, "LateFinish");

    const e =
      entries !== null && entries > 0
        ? entries
        : count !== null && count > 0
          ? count
          : 0;
    if (profit != null) {
      sumProfit += profit;
      profitHits++;
    }
    if (roi != null) rois.push(roi);

    if (e > 0) {
      sumEntries += e;
      if (itm != null) {
        sumItmW += itm * e;
        itmDenom += e;
      }
      if (ability != null) {
        sumAbilityW += ability * e;
        abilityDenom += e;
      }
      if (avStake != null) {
        sumStakeW += avStake * e;
        stakeDenom += e;
      }
      if (early != null) {
        sumEarlyW += early * e;
        earlyDenom += e;
      }
      if (late != null) {
        sumLateW += late * e;
        lateDenom += e;
      }
    }
  }

  const roiTotal = rois.length ? avg(rois) : null;

  return {
    roi: roiTotal,
    /** Mantido alinhado a `roi` (não usamos mais um “segundo” ROI ponderado na UI). */
    roiWeighted: roiTotal,
    profit: profitHits > 0 ? sumProfit : null,
    entries: sumEntries > 0 ? sumEntries : null,
    itm: itmDenom > 0 ? sumItmW / itmDenom : null,
    ability: abilityDenom > 0 ? sumAbilityW / abilityDenom : null,
    avStake: stakeDenom > 0 ? sumStakeW / stakeDenom : null,
    earlyFinish: earlyDenom > 0 ? sumEarlyW / earlyDenom : null,
    lateFinish: lateDenom > 0 ? sumLateW / lateDenom : null,
  };
}

async function buildTypeStatsForPeriod(
  period: "30d" | "90d",
  singlePlayerId?: string
): Promise<TypeStat[]> {
  const keys = period === "30d" ? SHARKSCOPE_TYPE_BREAKDOWN_KEYS : SHARKSCOPE_TYPE_BREAKDOWN_KEYS_90D;
  const dataType = period === "30d" ? "stats_30d" : "stats_90d";
  const rows: TypeStat[] = [];

  for (const { type, filterKey } of keys) {
    const caches = await prisma.sharkScopeCache.findMany({
      where: {
        dataType,
        filterKey,
        expiresAt: { gt: new Date() },
        ...(singlePlayerId
          ? { playerNick: { playerId: singlePlayerId } }
          : {}),
      },
      select: { rawData: true },
    });

    rows.push({
      type,
      ...aggregateTypeStatsFromCaches(caches),
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
    typeStats90d,
  ] = await Promise.all([
    buildNetworkStatsForPeriod("30d"),
    buildNetworkStatsForPeriod("90d"),
    buildSiteAnalyticsExtras("30d"),
    buildSiteAnalyticsExtras("90d"),
    buildRanking("stats_30d"),
    buildRanking("stats_90d"),
    buildTierStats("stats_30d"),
    buildTierStats("stats_90d"),
    buildTypeStatsForPeriod("30d"),
    buildTypeStatsForPeriod("90d"),
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
    typeStats90d,
  };
}

/** Mesmas séries que `loadAnalyticsPayload`, mas só caches do jogador (debug / confronto com o site SharkScope). Sem `unstable_cache`. */
export async function loadAnalyticsPayloadForPlayer(playerId: string) {
  const player = await prisma.player.findFirst({
    where: { id: playerId, status: "ACTIVE", playerGroup: { not: null } },
    select: { id: true },
  });
  if (!player) {
    throw new Error("Jogador não encontrado ou sem grupo Shark.");
  }
  const pid = player.id;
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
    typeStats90d,
  ] = await Promise.all([
    buildNetworkStatsForPeriod("30d", pid),
    buildNetworkStatsForPeriod("90d", pid),
    buildSiteAnalyticsExtras("30d", pid),
    buildSiteAnalyticsExtras("90d", pid),
    buildRanking("stats_30d", pid),
    buildRanking("stats_90d", pid),
    buildTierStats("stats_30d", pid),
    buildTierStats("stats_90d", pid),
    buildTypeStatsForPeriod("30d", pid),
    buildTypeStatsForPeriod("90d", pid),
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
    typeStats90d,
    hasData30d: sharkscopeStatsHasData(stats30d),
    hasData90d: sharkscopeStatsHasData(stats90d),
  };
}

const cachedSharkscopeAnalytics = unstable_cache(
  loadAnalyticsPayload,
  ["sharkscope-analytics-v21"],
  { revalidate: 60, tags: ["sharkscope-analytics"] }
);

export function getCachedSharkscopeAnalytics() {
  return cachedSharkscopeAnalytics();
}
