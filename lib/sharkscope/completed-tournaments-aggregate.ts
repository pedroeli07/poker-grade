import { POKER_NETWORKS } from "@/lib/constants/poker-networks";

/** Agregação por rede (time ou jogador): lucro, stake, volume e contadores para ITM / heurísticas FP/FT. */
export type NetworkAggBucket = {
  profit: number;
  stake: number;
  entries: number;
  itmHits: number;
  earlyHits: number;
  lateHits: number;
};

export function emptyNetworkAggBucket(): NetworkAggBucket {
  return { profit: 0, stake: 0, entries: 0, itmHits: 0, earlyHits: 0, lateHits: 0 };
}

/** Payload gravado em `SharkScopeCache.rawData` para `group_site_breakdown_*`. v2 inclui breakdown por nick SharkScope no grupo. */
export type GroupSiteBreakdownPayload = {
  v: 1 | 2;
  groupName: string;
  filterBody: string;
  pagesFetched: number;
  tournamentRows: number;
  byNetwork: Record<string, NetworkAggBucket>;
  /** Nick SharkScope normalizado (minúsculas) → rede → bucket */
  byPlayerNick?: Record<string, Record<string, NetworkAggBucket>>;
};

function parseNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const x = parseFloat(v.replace(",", "."));
    return Number.isFinite(x) ? x : 0;
  }
  return 0;
}

function parseBucket(o: Record<string, unknown>): NetworkAggBucket {
  return {
    profit: parseNum(o.profit),
    stake: parseNum(o.stake),
    entries: parseNum(o.entries),
    itmHits: parseNum(o.itmHits),
    earlyHits: parseNum(o.earlyHits),
    lateHits: parseNum(o.lateHits),
  };
}

export function parseGroupSiteBreakdownPayload(raw: unknown): GroupSiteBreakdownPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const v = r.v;
  if (v !== 1 && v !== 2) return null;
  if (typeof r.groupName !== "string") return null;
  if (typeof r.filterBody !== "string") return null;
  if (typeof r.byNetwork !== "object" || r.byNetwork === null) return null;
  const bn = r.byNetwork as Record<string, unknown>;
  const byNetwork: Record<string, NetworkAggBucket> = {};
  for (const [k, val] of Object.entries(bn)) {
    if (!val || typeof val !== "object") continue;
    byNetwork[k] = parseBucket(val as Record<string, unknown>);
  }

  let byPlayerNick: Record<string, Record<string, NetworkAggBucket>> | undefined;
  if (v === 2 && r.byPlayerNick && typeof r.byPlayerNick === "object") {
    const bp = r.byPlayerNick as Record<string, unknown>;
    byPlayerNick = {};
    for (const [pk, netObj] of Object.entries(bp)) {
      if (!netObj || typeof netObj !== "object") continue;
      const inner: Record<string, NetworkAggBucket> = {};
      for (const [nk, val] of Object.entries(netObj as Record<string, unknown>)) {
        if (!val || typeof val !== "object") continue;
        inner[nk] = parseBucket(val as Record<string, unknown>);
      }
      if (Object.keys(inner).length) byPlayerNick[pk] = inner;
    }
  }

  return {
    v: v as 1 | 2,
    groupName: r.groupName,
    filterBody: r.filterBody,
    pagesFetched: typeof r.pagesFetched === "number" ? r.pagesFetched : 0,
    tournamentRows: typeof r.tournamentRows === "number" ? r.tournamentRows : 0,
    byNetwork,
    byPlayerNick,
  };
}

const APP_NETWORK_KEYS = new Set(Object.keys(POKER_NETWORKS));

export function sharkscopeNetworkToAppKey(networkRaw: string): string | null {
  const n = networkRaw.trim();
  if (!n) return null;

  const lower = n.toLowerCase();

  if (lower.includes("fr-es-pt")) return "pokerstars_fr";
  if (lower.includes("pokerstars")) return "pokerstars";
  if (lower === "ggnetwork" || lower === "gg") return "gg";
  if (lower.includes("partypoker") || lower === "party") return "partypoker";
  if (lower === "ipoker") return "ipoker";
  if (lower === "888poker" || lower === "888") return "888";
  if (lower === "wpn") return "wpt";
  // SharkScope pode enviar "Coin Poker", "COINPOKER", etc.
  const noSpace = lower.replace(/[\s_-]+/g, "");
  if (noSpace === "coinpoker" || noSpace.startsWith("coinpoker")) return "coinpoker";
  if (lower.includes("chico")) return "chico";

  if (APP_NETWORK_KEYS.has(lower)) return lower;

  return null;
}

function prizeFromEntry(entry: Record<string, unknown>): number {
  return parseNum(entry["@prize"]);
}

/** Heurística a partir de posição vs field: “tardia” ~ top 12%; “precoce” ~ pior que ~55% do field. ITM usa prêmio > 0 na entrada. */
function classifyFinish(position: number, entrants: number): { early: boolean; late: boolean } {
  if (!Number.isFinite(position) || position <= 0 || !Number.isFinite(entrants) || entrants < 2) {
    return { early: false, late: false };
  }
  const lateThreshold = Math.max(9, Math.ceil(entrants * 0.12));
  const earlyThreshold = Math.ceil(entrants * 0.55);
  return {
    early: position > earlyThreshold,
    late: position <= lateThreshold,
  };
}

function addToBucket(b: NetworkAggBucket, delta: Partial<NetworkAggBucket> & { profit?: number; stake?: number; entries?: number }) {
  b.profit += delta.profit ?? 0;
  b.stake += delta.stake ?? 0;
  b.entries += delta.entries ?? 0;
  b.itmHits += delta.itmHits ?? 0;
  b.earlyHits += delta.earlyHits ?? 0;
  b.lateHits += delta.lateHits ?? 0;
}

function bumpBucket(
  into: Map<string, NetworkAggBucket>,
  netKey: string,
  opts: {
    profit: number;
    stake: number;
    entries: number;
    itmHits: number;
    earlyHits: number;
    lateHits: number;
  }
) {
  const b = into.get(netKey) ?? emptyNetworkAggBucket();
  addToBucket(b, opts);
  into.set(netKey, b);
}

function processOneEntry(
  entry: Record<string, unknown>,
  tournament: Record<string, unknown>,
  byNetwork: Map<string, NetworkAggBucket>,
  byPlayer: Map<string, Map<string, NetworkAggBucket>>
): boolean {
  const netRaw = tournament["@network"];
  if (typeof netRaw !== "string") return false;
  const appKey = sharkscopeNetworkToAppKey(netRaw);
  if (!appKey) return false;

  const stake = parseNum(tournament["@stake"]);
  const profit = prizeFromEntry(entry);
  const position = parseNum(entry["@position"]);
  const entrants = parseNum(tournament["@totalEntrants"]);
  const cashed = profit > 0.005;
  const { early, late } = classifyFinish(position, entrants);
  const itmHit = cashed ? 1 : 0;

  bumpBucket(byNetwork, appKey, {
    profit,
    stake,
    entries: 1,
    itmHits: itmHit,
    earlyHits: early ? 1 : 0,
    lateHits: late ? 1 : 0,
  });

  const nameRaw = entry["@playerName"];
  if (typeof nameRaw === "string" && nameRaw.trim()) {
    const pk = nameRaw.trim().toLowerCase();
    if (!byPlayer.has(pk)) byPlayer.set(pk, new Map());
    bumpBucket(byPlayer.get(pk)!, appKey, {
      profit,
      stake,
      entries: 1,
      itmHits: itmHit,
      earlyHits: early ? 1 : 0,
      lateHits: late ? 1 : 0,
    });
  }

  return true;
}

function processTournamentNode(
  r: Record<string, unknown>,
  byNetwork: Map<string, NetworkAggBucket>,
  byPlayer: Map<string, Map<string, NetworkAggBucket>>,
  tournamentRows: { n: number }
): void {
  if (r.TournamentEntry == null) return;
  const hasNet = typeof r["@network"] === "string";
  const hasId = r["@id"] != null || r.tournamentId != null;
  if (!hasNet || !hasId) return;

  const te = r.TournamentEntry;
  const entries = Array.isArray(te) ? te : te != null && typeof te === "object" ? [te] : [];

  let any = false;
  for (const e of entries) {
    if (e && typeof e === "object") {
      if (processOneEntry(e as Record<string, unknown>, r, byNetwork, byPlayer)) any = true;
    }
  }
  if (any) tournamentRows.n += 1;
}

function walk(
  o: unknown,
  byNetwork: Map<string, NetworkAggBucket>,
  byPlayer: Map<string, Map<string, NetworkAggBucket>>,
  tournamentRows: { n: number }
): void {
  if (o === null || o === undefined) return;
  if (Array.isArray(o)) {
    for (const x of o) walk(x, byNetwork, byPlayer, tournamentRows);
    return;
  }
  if (typeof o !== "object") return;
  const r = o as Record<string, unknown>;
  processTournamentNode(r, byNetwork, byPlayer, tournamentRows);
  for (const v of Object.values(r)) walk(v, byNetwork, byPlayer, tournamentRows);
}

export function aggregateCompletedTournamentsFull(raw: unknown): {
  byNetwork: Map<string, NetworkAggBucket>;
  byPlayer: Map<string, Map<string, NetworkAggBucket>>;
  tournamentRows: number;
} {
  const byNetwork = new Map<string, NetworkAggBucket>();
  const byPlayer = new Map<string, Map<string, NetworkAggBucket>>();
  const tournamentRows = { n: 0 };
  walk(raw, byNetwork, byPlayer, tournamentRows);
  return { byNetwork, byPlayer, tournamentRows: tournamentRows.n };
}

export function mergeNetworkAggMaps(
  a: Map<string, NetworkAggBucket>,
  b: Map<string, NetworkAggBucket>
): Map<string, NetworkAggBucket> {
  const out = new Map(a);
  for (const [k, v] of b) {
    const cur = out.get(k) ?? emptyNetworkAggBucket();
    out.set(k, {
      profit: cur.profit + v.profit,
      stake: cur.stake + v.stake,
      entries: cur.entries + v.entries,
      itmHits: cur.itmHits + v.itmHits,
      earlyHits: cur.earlyHits + v.earlyHits,
      lateHits: cur.lateHits + v.lateHits,
    });
  }
  return out;
}

export function mergePlayerNetworkMaps(
  into: Map<string, Map<string, NetworkAggBucket>>,
  page: Map<string, Map<string, NetworkAggBucket>>
): Map<string, Map<string, NetworkAggBucket>> {
  for (const [pk, netMap] of page) {
    if (!into.has(pk)) into.set(pk, new Map());
    const inner = into.get(pk)!;
    for (const [net, b] of netMap) {
      const cur = inner.get(net) ?? emptyNetworkAggBucket();
      inner.set(net, {
        profit: cur.profit + b.profit,
        stake: cur.stake + b.stake,
        entries: cur.entries + b.entries,
        itmHits: cur.itmHits + b.itmHits,
        earlyHits: cur.earlyHits + b.earlyHits,
        lateHits: cur.lateHits + b.lateHits,
      });
    }
  }
  return into;
}

/** ROI agregado: 100 × lucro / stake. */
export function roiFromAgg(bucket: NetworkAggBucket): number | null {
  if (bucket.stake <= 0) return null;
  return (100 * bucket.profit) / bucket.stake;
}

export function pctFromRatio(hits: number, entries: number): number | null {
  if (entries <= 0) return null;
  return (100 * hits) / entries;
}
