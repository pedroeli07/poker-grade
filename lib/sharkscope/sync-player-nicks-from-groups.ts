/**
 * Lógica para sincronizar nicks por rede a partir de `completedTournaments` agregados
 * no cache `group_site_breakdown_30d` (Player Group), ou fetch direto à API.
 */
import { prisma } from "@/lib/prisma";
import { sharkScopeAppKey, sharkScopeAppName } from "@/lib/constants";
import { sharkScopeGet } from "@/lib/utils";
import {
  aggregateCompletedTournamentsFull,
  mergeNetworkAggMaps,
  mergePlayerNetworkMaps,
  parseGroupSiteBreakdownPayload,
  type GroupSiteBreakdownPayload,
  type NetworkAggBucket,
} from "@/lib/sharkscope/completed-tournaments-aggregate";
import {
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
  sharkscopeSiteMaxPages,
} from "@/lib/constants/sharkscope-group-site";
import { SHARKSCOPE_STATS_FILTER_30D } from "@/lib/constants/sharkscope-type-filters";

export type PlayerLite = { id: string; name: string; nickname: string | null };

/** Para grupo com 1 jogador no app: a chave com mais inscrições agregadas tende a ser a pessoa certa. */
export function pickBestSharkKeyByVolume(
  sharkKeys: string[],
  byPlayerNick: Record<string, Record<string, NetworkAggBucket>>
): { key: string | null; entries: number } {
  let best: string | null = null;
  let maxE = 0;
  for (const k of sharkKeys) {
    const nets = byPlayerNick[k];
    if (!nets) continue;
    const total = Object.values(nets).reduce((s, b) => s + (b?.entries ?? 0), 0);
    if (total > maxE) {
      maxE = total;
      best = k;
    }
  }
  return { key: best, entries: maxE };
}

function normalizeStr(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function collapseAlnum(s: string): string {
  return normalizeStr(s).replace(/\s+/g, "");
}

/** Pontuação heurística entre nome do jogador no app e chave @playerName (minúscula) do SharkScope. */
export function scorePlayerForSharkKey(
  player: PlayerLite,
  sharkKey: string,
  sharkGroupName?: string | null
): number {
  const sk = sharkKey.trim().toLowerCase();
  if (!sk) return 0;

  const candidates = [player.name, player.nickname].filter(Boolean) as string[];
  let best = 0;

  if (sharkGroupName) {
    const gh = normalizeStr(sharkGroupName);
    if (sk.length >= 4 && gh.includes(sk)) {
      best = Math.max(best, 78);
    }
    const stop = new Set(["cl", "team", "2022", "2023", "2024", "2025", "2026", "all"]);
    for (const token of gh.split(/[\s_.-]+/)) {
      if (token.length < 3 || stop.has(token)) continue;
      if (sk.includes(token) || token.includes(sk)) {
        best = Math.max(best, 62);
        break;
      }
    }
  }

  for (const raw of candidates) {
    const pn = normalizeStr(raw);
    const skc = collapseAlnum(sk);
    const pnc = collapseAlnum(raw);
    if (pnc.length >= 4 && skc === pnc) {
      best = Math.max(best, 100);
      continue;
    }
    if (pnc.length >= 6 && skc.length >= 6 && (skc.includes(pnc) || pnc.includes(skc))) {
      best = Math.max(best, 95);
      continue;
    }
    if (pn === sk) {
      best = Math.max(best, 100);
      continue;
    }
    const parts = pn.split(/\s+/).filter((p) => p.length >= 2);
    const first = parts[0] ?? "";
    const last = parts.length >= 2 ? parts[parts.length - 1]! : "";
    if (last.length >= 4 && sk.includes(last)) {
      best = Math.max(best, 92);
      continue;
    }
    if (first.length >= 3 && (sk.startsWith(first) || sk.includes(first))) {
      best = Math.max(best, 88);
      continue;
    }
    if (pn.includes(sk) || sk.includes(pn)) {
      best = Math.max(best, 72);
      continue;
    }
    const clean = (x: string) => x.replace(/[^a-z0-9]/g, "");
    const csk = clean(sk);
    const cpn = clean(pn);
    if (cpn.length >= 4 && csk.length >= 4 && (cpn.includes(csk.slice(0, 5)) || csk.includes(cpn.slice(0, 5)))) {
      best = Math.max(best, 55);
    }
  }
  return best;
}

/**
 * Emparelha cada chave SharkScope (nick normalizado no torneio) a no máximo um jogador do grupo.
 * Ordem: chaves mais “difíceis” primeiro (menor melhor pontuação entre todos).
 */
export function assignSharkKeysToPlayers(
  players: PlayerLite[],
  sharkKeys: string[],
  minScore: number,
  sharkGroupName?: string | null,
  opts?: { volumeFallback?: boolean; byPlayerNick?: Record<string, Record<string, NetworkAggBucket>> }
): { assignments: Map<string, string>; unmatchedKeys: string[]; unmatchedPlayers: PlayerLite[] } {
  const assignments = new Map<string, string>(); // playerId -> sharkKey
  const usedPlayers = new Set<string>();
  const volumeFallback = opts?.volumeFallback ?? false;
  const byPlayerNick = opts?.byPlayerNick;

  /** Um jogador no grupo: escolhe a chave com maior pontuação (evita casar a primeira razoável). */
  if (players.length === 1 && sharkKeys.length >= 1) {
    const p = players[0]!;
    let bestKey: string | null = null;
    let bestScore = -1;
    for (const k of sharkKeys) {
      const s = scorePlayerForSharkKey(p, k, sharkGroupName);
      if (s > bestScore) {
        bestScore = s;
        bestKey = k;
      }
    }
    if (bestKey != null && bestScore >= minScore) {
      assignments.set(p.id, bestKey);
      usedPlayers.add(p.id);
      return {
        assignments,
        unmatchedKeys: sharkKeys.filter((k) => k !== bestKey),
        unmatchedPlayers: [],
      };
    }
    if (
      volumeFallback &&
      byPlayerNick &&
      Object.keys(byPlayerNick).length > 0
    ) {
      const { key: volKey, entries } = pickBestSharkKeyByVolume(sharkKeys, byPlayerNick);
      if (volKey && entries > 0) {
        assignments.set(p.id, volKey);
        usedPlayers.add(p.id);
        return {
          assignments,
          unmatchedKeys: sharkKeys.filter((k) => k !== volKey),
          unmatchedPlayers: [],
        };
      }
    }
    return {
      assignments: new Map(),
      unmatchedKeys: [...sharkKeys],
      unmatchedPlayers: [p],
    };
  }

  const keysSorted = [...sharkKeys].sort((a, b) => {
    const bestA = Math.max(...players.map((p) => scorePlayerForSharkKey(p, a, sharkGroupName)), 0);
    const bestB = Math.max(...players.map((p) => scorePlayerForSharkKey(p, b, sharkGroupName)), 0);
    return bestA - bestB;
  });

  const unmatchedKeys: string[] = [];

  for (const key of keysSorted) {
    let best: { playerId: string; score: number } | null = null;
    for (const p of players) {
      if (usedPlayers.has(p.id)) continue;
      const s = scorePlayerForSharkKey(p, key, sharkGroupName);
      if (s < minScore) continue;
      if (!best || s > best.score) best = { playerId: p.id, score: s };
    }
    if (best) {
      assignments.set(best.playerId, key);
      usedPlayers.add(best.playerId);
    } else {
      unmatchedKeys.push(key);
    }
  }

  const unmatchedPlayers = players.filter((p) => !usedPlayers.has(p.id));
  return { assignments, unmatchedKeys, unmatchedPlayers };
}

async function loadBreakdownFromCache(groupName: string): Promise<GroupSiteBreakdownPayload | null> {
  const nick = await prisma.playerNick.findFirst({
    where: { network: "PlayerGroup", nick: groupName },
    select: { id: true },
  });
  if (!nick) return null;

  const row = await prisma.sharkScopeCache.findUnique({
    where: {
      playerNickId_dataType_filterKey: {
        playerNickId: nick.id,
        dataType: SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
        filterKey: SHARKSCOPE_STATS_FILTER_30D,
      },
    },
    select: { rawData: true },
  });
  if (!row?.rawData) return null;
  return parseGroupSiteBreakdownPayload(row.rawData);
}

/** Mesma paginação do cron `syncGroupSiteBreakdownForGroup` (30D). */
export async function fetchGroupSiteBreakdown30dLive(groupName: string): Promise<GroupSiteBreakdownPayload> {
  const maxPages = sharkscopeSiteMaxPages();
  const filterBody = "Date:30D";

  let merged = new Map<string, NetworkAggBucket>();
  let mergedPlayer = new Map<string, Map<string, NetworkAggBucket>>();
  let pagesFetched = 0;
  let tournamentRowsTotal = 0;

  for (let page = 0; page < maxPages; page++) {
    const start = page * 100 + 1;
    const end = start + 99;
    const path = `/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/completedTournaments?order=Last,${start}~${end}&filter=${encodeURIComponent(filterBody)}`;
    const raw = await sharkScopeGet(path);
    const { byNetwork, byPlayer, tournamentRows } = aggregateCompletedTournamentsFull(raw);
    merged = mergeNetworkAggMaps(merged, byNetwork);
    mergePlayerNetworkMaps(mergedPlayer, byPlayer);
    tournamentRowsTotal += tournamentRows;
    pagesFetched++;
    if (tournamentRows === 0) break;
    if (tournamentRows < 100) break;
  }

  const byPlayerNick: Record<string, Record<string, NetworkAggBucket>> = {};
  for (const [pk, inner] of mergedPlayer) {
    byPlayerNick[pk] = Object.fromEntries(inner);
  }

  return {
    v: 2,
    groupName,
    filterBody,
    pagesFetched,
    tournamentRows: tournamentRowsTotal,
    byNetwork: Object.fromEntries(merged),
    byPlayerNick,
  };
}

export async function getOrFetchGroupBreakdown30d(
  groupName: string,
  preferLive: boolean
): Promise<GroupSiteBreakdownPayload | null> {
  if (!preferLive) {
    const fromCache = await loadBreakdownFromCache(groupName);
    if (fromCache?.byPlayerNick && Object.keys(fromCache.byPlayerNick).length > 0) {
      return fromCache;
    }
  }
  if (sharkScopeAppName && sharkScopeAppKey) {
    try {
      return await fetchGroupSiteBreakdown30dLive(groupName);
    } catch (e) {
      console.error(`[sync-nicks] Falha live para grupo "${groupName}":`, e);
    }
  }
  return loadBreakdownFromCache(groupName);
}

export type NickUpsertPlan = {
  playerId: string;
  playerName: string;
  sharkKey: string;
  network: string;
  nick: string;
};

export function buildNickUpsertPlans(
  players: PlayerLite[],
  assignments: Map<string, string>,
  byPlayerNick: Record<string, Record<string, NetworkAggBucket>>
): NickUpsertPlan[] {
  const plans: NickUpsertPlan[] = [];
  const seen = new Set<string>();

  for (const [playerId, sharkKey] of assignments) {
    const perNet = byPlayerNick[sharkKey];
    if (!perNet) continue;
    const player = players.find((p) => p.id === playerId);
    if (!player) continue;

    /** Chaves já são ids do app (`gg`, `chico`, …) — ver `aggregateCompletedTournaments`. */
    for (const [appKey, bucket] of Object.entries(perNet)) {
      if (!bucket || bucket.entries <= 0) continue;
      const dedupe = `${playerId}::${appKey}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);

      plans.push({
        playerId,
        playerName: player.name,
        sharkKey,
        network: appKey,
        nick: sharkKey,
      });
    }
  }

  return plans;
}
