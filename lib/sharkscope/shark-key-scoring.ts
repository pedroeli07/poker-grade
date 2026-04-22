import { SHARK_KEY_SCORE_STOP_TOKENS } from "@/lib/constants/sharkscope/sync-nicks";
import type { NetworkAggBucket } from "@/lib/types/sharkscope/completed-tournaments";
import type { PlayerLite } from "@/lib/types/sharkscope/group-sync";

function normalizeStr(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

function collapseAlnum(s: string): string {
  return normalizeStr(s).replace(/\s+/g, "");
}

const cleanAlnum = (x: string) => x.replace(/[^a-z0-9]/g, "");

function scoreFromGroupName(sk: string, sharkGroupName: string): number {
  let best = 0;
  const gh = normalizeStr(sharkGroupName);
  if (sk.length >= 4 && gh.includes(sk)) best = Math.max(best, 78);

  for (const token of gh.split(/[\s_.-]+/)) {
    if (token.length < 3 || SHARK_KEY_SCORE_STOP_TOKENS.has(token)) continue;
    if (sk.includes(token) || token.includes(sk)) {
      best = Math.max(best, 62);
      break;
    }
  }
  return best;
}

function scoreFromCandidate(raw: string, sk: string): number {
  const pn = normalizeStr(raw);
  const skc = collapseAlnum(sk);
  const pnc = collapseAlnum(raw);

  let best = 0;
  if (pnc.length >= 4 && skc === pnc) best = Math.max(best, 100);
  if (pnc.length >= 6 && skc.length >= 6 && (skc.includes(pnc) || pnc.includes(skc))) best = Math.max(best, 95);
  if (pn === sk) best = Math.max(best, 100);

  const parts = pn.split(/\s+/).filter((p) => p.length >= 2);
  const first = parts[0] ?? "";
  const last = parts.length >= 2 ? parts[parts.length - 1]! : "";

  if (last.length >= 4 && sk.includes(last)) best = Math.max(best, 92);
  if (first.length >= 3 && (sk.startsWith(first) || sk.includes(first))) best = Math.max(best, 88);
  if (pn.includes(sk) || sk.includes(pn)) best = Math.max(best, 72);

  const csk = cleanAlnum(sk);
  const cpn = cleanAlnum(pn);
  if (cpn.length >= 4 && csk.length >= 4 && (cpn.includes(csk.slice(0, 5)) || csk.includes(cpn.slice(0, 5)))) {
    best = Math.max(best, 55);
  }
  return best;
}

/** Para grupo com 1 jogador: a chave com mais inscrições agregadas tende a ser a pessoa certa. */
export function pickBestSharkKeyByVolume(
  sharkKeys: string[],
  byPlayerNick: Record<string, Record<string, NetworkAggBucket>>
): { key: string | null; entries: number } {
  let best: string | null = null;
  let maxE = 0;
  for (const k of sharkKeys) {
    const total = Object.values(byPlayerNick[k] ?? {}).reduce((s, b) => s + (b?.entries ?? 0), 0);
    if (total > maxE) {
      maxE = total;
      best = k;
    }
  }
  return { key: best, entries: maxE };
}

/** Pontuação heurística entre nome do jogador no app e chave @playerName do SharkScope. */
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
    best = Math.max(best, scoreFromGroupName(sk, sharkGroupName));
  }

  for (const raw of candidates) {
    best = Math.max(best, scoreFromCandidate(raw, sk));
  }
  return best;
}

function assignSinglePlayer(
  players: PlayerLite[],
  sharkKeys: string[],
  minScore: number,
  sharkGroupName: string | null | undefined,
  volumeFallback: boolean,
  byPlayerNick: Record<string, Record<string, NetworkAggBucket>> | undefined
): { assignments: Map<string, string>; unmatchedKeys: string[]; unmatchedPlayers: PlayerLite[] } {
  const p = players[0]!;
  const bestKey = sharkKeys.reduce<{ key: string | null; score: number }>(
    (acc, k) => {
      const s = scorePlayerForSharkKey(p, k, sharkGroupName);
      return s > acc.score ? { key: k, score: s } : acc;
    },
    { key: null, score: -1 }
  );

  const matched =
    bestKey.key !== null && bestKey.score >= minScore
      ? bestKey.key
      : volumeFallback && byPlayerNick && Object.keys(byPlayerNick).length > 0
        ? (() => {
            const { key, entries } = pickBestSharkKeyByVolume(sharkKeys, byPlayerNick);
            return entries > 0 ? key : null;
          })()
        : null;

  if (matched) {
    const assignments = new Map<string, string>([[p.id, matched]]);
    return { assignments, unmatchedKeys: sharkKeys.filter((k) => k !== matched), unmatchedPlayers: [] };
  }
  return { assignments: new Map(), unmatchedKeys: [...sharkKeys], unmatchedPlayers: [p] };
}

function assignMultiPlayer(
  players: PlayerLite[],
  sharkKeys: string[],
  minScore: number,
  sharkGroupName: string | null | undefined
): { assignments: Map<string, string>; unmatchedKeys: string[]; unmatchedPlayers: PlayerLite[] } {
  const assignments = new Map<string, string>();
  const usedPlayers = new Set<string>();

  const keysSorted = [...sharkKeys].sort((a, b) => {
    const scoreOf = (k: string) => Math.max(...players.map((p) => scorePlayerForSharkKey(p, k, sharkGroupName)), 0);
    return scoreOf(a) - scoreOf(b);
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
    } else unmatchedKeys.push(key);
  }

  return {
    assignments,
    unmatchedKeys,
    unmatchedPlayers: players.filter((p) => !usedPlayers.has(p.id)),
  };
}

/**
 * Emparelha cada chave SharkScope a no máximo um jogador do grupo.
 * Ordem: chaves mais "difíceis" primeiro (menor melhor pontuação entre todos).
 */
export function assignSharkKeysToPlayers(
  players: PlayerLite[],
  sharkKeys: string[],
  minScore: number,
  sharkGroupName?: string | null,
  opts?: { volumeFallback?: boolean; byPlayerNick?: Record<string, Record<string, NetworkAggBucket>> }
): { assignments: Map<string, string>; unmatchedKeys: string[]; unmatchedPlayers: PlayerLite[] } {
  const { volumeFallback = false, byPlayerNick } = opts ?? {};

  if (players.length === 1 && sharkKeys.length >= 1) {
    return assignSinglePlayer(players, sharkKeys, minScore, sharkGroupName, volumeFallback, byPlayerNick);
  }

  return assignMultiPlayer(players, sharkKeys, minScore, sharkGroupName);
}
