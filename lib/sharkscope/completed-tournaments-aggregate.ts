import { POKER_NETWORK_KEYS_SET } from "@/lib/constants/poker-networks";
import { SHARKSCOPE_BOUNTY_TYPE_CODES } from "@/lib/constants/sharkscope-tournament-classify";
import type {
  GroupSiteBreakdownPayload,
  GroupSiteBreakdownPayloadV3,
  NetworkAggBucket,
  TournamentRow,
} from "@/lib/types/sharkscope/completed-tournaments";

export type {
  GroupSiteBreakdownPayload,
  GroupSiteBreakdownPayloadV3,
  NetworkAggBucket,
  TournamentRow,
} from "@/lib/types/sharkscope/completed-tournaments";

const BOUNTY_TYPE_CODES = new Set<string>(SHARKSCOPE_BOUNTY_TYPE_CODES);

function normalizeFlagTokens(flags: string): string[] {
  return flags
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.toUpperCase());
}

function isBountyStructure(flags: string): boolean {
  const raw = flags.trim();
  if (!raw) return false;

  // Rótulos longos (export CSV / payloads descritivos), não só códigos curtos.
  if (/\bBOUNTY\b/i.test(raw)) return true;
  if (/MYSTERY-BOUNTY|PROGRESSIVE-BOUNTY|PROGRESSIVE KO|\bPKO\b/i.test(raw)) return true;

  for (const t of normalizeFlagTokens(flags)) {
    if (BOUNTY_TYPE_CODES.has(t)) return true;
  }
  return false;
}

function isSatelliteFormat(flags: string): boolean {
  const raw = flags.trim();
  if (!raw) return false;

  for (const t of normalizeFlagTokens(flags)) {
    if (t === "SAT") return true;
  }
  if (/^\s*Satellite\b/i.test(raw) || /\bSatellite\b/i.test(raw)) return true;
  return false;
}

/**
 * Bounty antes de satélite: satélites para torneios PKO (“Satellite Bounty”) entram em bounty, como no filtro do site.
 * Evita `includes("B")` na string inteira (ex.: token `SUB` não deve virar bounty).
 */
export function classifyTournamentType(flags: string): TournamentRow["tournamentType"] {
  if (isBountyStructure(flags)) return "bounty";
  if (isSatelliteFormat(flags)) return "satellite";
  return "vanilla";
}

export function emptyNetworkAggBucket(): NetworkAggBucket {
  return { profit: 0, stake: 0, entries: 0, itmHits: 0, earlyHits: 0, lateHits: 0 };
}

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
  if (v !== 1 && v !== 2 && v !== 3) return null;
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
  if ((v === 2 || v === 3) && r.byPlayerNick && typeof r.byPlayerNick === "object") {
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

  let tournaments: TournamentRow[] | undefined;
  if (v === 3 && Array.isArray(r.tournaments)) {
    tournaments = [];
    for (const t of r.tournaments) {
      if (!t || typeof t !== "object") continue;
      const tr = t as Record<string, unknown>;
      const stake = parseNum(tr.stake);
      const rake = parseNum(tr.rake);
      const investment =
        typeof tr.investment === "number" && Number.isFinite(tr.investment)
          ? tr.investment
          : stake + rake;
      const flagsStr = typeof tr.flags === "string" ? tr.flags : "";
      tournaments.push({
        date: parseNum(tr.date),
        network: typeof tr.network === "string" ? tr.network : "",
        networkKey: typeof tr.networkKey === "string" ? tr.networkKey : null,
        stake,
        rake,
        investment,
        prize: parseNum(tr.prize),
        position: parseNum(tr.position),
        entrants: parseNum(tr.entrants),
        playerName: typeof tr.playerName === "string" ? tr.playerName : "",
        flags: flagsStr,
        tournamentType: classifyTournamentType(flagsStr),
        gameClass: typeof tr.gameClass === "string" ? tr.gameClass : "",
        tournamentId: typeof tr.tournamentId === "string" ? tr.tournamentId : "",
      });
    }
  }

  if (v === 3) {
    return {
      v: 3,
      groupName: r.groupName as string,
      filterBody: r.filterBody as string,
      pagesFetched: typeof r.pagesFetched === "number" ? r.pagesFetched : 0,
      tournamentRows: typeof r.tournamentRows === "number" ? r.tournamentRows : 0,
      byNetwork,
      byPlayerNick,
      tournaments: tournaments ?? [],
    };
  }

  return {
    v: v as 1 | 2,
    groupName: r.groupName as string,
    filterBody: r.filterBody as string,
    pagesFetched: typeof r.pagesFetched === "number" ? r.pagesFetched : 0,
    tournamentRows: typeof r.tournamentRows === "number" ? r.tournamentRows : 0,
    byNetwork,
    byPlayerNick,
  };
}

export function sharkscopeNetworkToAppKey(networkRaw: string): string | null {
  const n = networkRaw.trim();
  if (!n) return null;

  const lower = n.toLowerCase();

  if (lower.includes("pokerstars.es") || lower.includes("pokerstarses")) return "pokerstars_es";
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

  if (POKER_NETWORK_KEYS_SET.has(lower)) return lower;

  return null;
}

function prizeFromEntry(entry: Record<string, unknown>): number {
  return parseNum(entry["@prize"]);
}

/** Buy-in incl. rake: nível entrada quando `expandMultiEntries`, senão nó torneio. */
function lineInvestment(tournament: Record<string, unknown>, entry: Record<string, unknown>): number {
  const es = parseNum(entry["@stake"]);
  const er = parseNum(entry["@rake"]);
  if (es > 0 || er > 0) return es + er;
  return parseNum(tournament["@stake"]) + parseNum(tournament["@rake"]);
}

/** Lucro líquido; `@profit` quando a API envia, senão `@prize` (net na resposta típica). */
function netProfitFromEntry(entry: Record<string, unknown>): number {
  const raw = entry["@profit"];
  if (raw !== undefined && raw !== null && raw !== "") {
    return parseNum(raw);
  }
  return prizeFromEntry(entry);
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
  byPlayer: Map<string, Map<string, NetworkAggBucket>>,
  rows?: TournamentRow[],
  skippedUnknownNetworks?: Map<string, number>
): boolean {
  const netRaw = tournament["@network"];
  if (typeof netRaw !== "string") return false;
  const appKey = sharkscopeNetworkToAppKey(netRaw);
  if (!appKey) {
    if (skippedUnknownNetworks) {
      skippedUnknownNetworks.set(netRaw, (skippedUnknownNetworks.get(netRaw) ?? 0) + 1);
    }
    return false;
  }

  const stake = parseNum(tournament["@stake"]);
  const rake = parseNum(tournament["@rake"]);
  const investment = lineInvestment(tournament, entry);
  const profit = netProfitFromEntry(entry);
  const position = parseNum(entry["@position"]);
  const entrants = parseNum(tournament["@totalEntrants"]);
  const cashed = profit > 0.005;
  const { early, late } = classifyFinish(position, entrants);
  const itmHit = cashed ? 1 : 0;

  bumpBucket(byNetwork, appKey, {
    profit,
    stake: investment,
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
      stake: investment,
      entries: 1,
      itmHits: itmHit,
      earlyHits: early ? 1 : 0,
      lateHits: late ? 1 : 0,
    });
  }

  if (rows) {
    const flags = typeof tournament["@flags"] === "string" ? tournament["@flags"] : "";
    rows.push({
      date: parseNum(tournament["@date"]),
      network: netRaw,
      networkKey: appKey,
      stake,
      rake,
      investment,
      prize: profit,
      position,
      entrants,
      playerName: typeof nameRaw === "string" ? nameRaw.trim() : "",
      flags,
      tournamentType: classifyTournamentType(flags),
      gameClass: typeof tournament["@gameClass"] === "string" ? tournament["@gameClass"] : "",
      tournamentId: String(tournament["@id"] ?? ""),
    });
  }

  return true;
}

function processTournamentNode(
  r: Record<string, unknown>,
  byNetwork: Map<string, NetworkAggBucket>,
  byPlayer: Map<string, Map<string, NetworkAggBucket>>,
  tournamentCount: { n: number },
  rows?: TournamentRow[],
  skippedUnknownNetworks?: Map<string, number>
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
      if (processOneEntry(e as Record<string, unknown>, r, byNetwork, byPlayer, rows, skippedUnknownNetworks))
        any = true;
    }
  }
  if (any) tournamentCount.n += 1;
}

function walk(
  o: unknown,
  byNetwork: Map<string, NetworkAggBucket>,
  byPlayer: Map<string, Map<string, NetworkAggBucket>>,
  tournamentCount: { n: number },
  rows?: TournamentRow[],
  skippedUnknownNetworks?: Map<string, number>
): void {
  if (o === null || o === undefined) return;
  if (Array.isArray(o)) {
    for (const x of o) walk(x, byNetwork, byPlayer, tournamentCount, rows, skippedUnknownNetworks);
    return;
  }
  if (typeof o !== "object") return;
  const r = o as Record<string, unknown>;
  processTournamentNode(r, byNetwork, byPlayer, tournamentCount, rows, skippedUnknownNetworks);
  for (const v of Object.values(r)) walk(v, byNetwork, byPlayer, tournamentCount, rows, skippedUnknownNetworks);
}

export function aggregateCompletedTournamentsFull(
  raw: unknown,
  collectRows = false
): {
  byNetwork: Map<string, NetworkAggBucket>;
  byPlayer: Map<string, Map<string, NetworkAggBucket>>;
  tournamentRows: number;
  rows: TournamentRow[];
  skippedUnknownNetworks: Map<string, number>;
} {
  const byNetwork = new Map<string, NetworkAggBucket>();
  const byPlayer = new Map<string, Map<string, NetworkAggBucket>>();
  const tournamentCount = { n: 0 };
  const rows: TournamentRow[] = [];
  const skippedUnknownNetworks = new Map<string, number>();
  walk(raw, byNetwork, byPlayer, tournamentCount, collectRows ? rows : undefined, skippedUnknownNetworks);
  return { byNetwork, byPlayer, tournamentRows: tournamentCount.n, rows, skippedUnknownNetworks };
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

/** ROI agregado: 100 × lucro / investimento (buy-in incl. rake por linha). */
export function roiFromAgg(bucket: NetworkAggBucket): number | null {
  if (bucket.stake <= 0) return null;
  return (100 * bucket.profit) / bucket.stake;
}

export function pctFromRatio(hits: number, entries: number): number | null {
  if (entries <= 0) return null;
  return (100 * hits) / entries;
}

/** Filtra `TournamentRow[]` por janela de tempo e opcionalmente por tipo de torneio. */
export function filterTournamentRows(
  rows: TournamentRow[],
  opts?: {
    afterTimestamp?: number;
    beforeTimestamp?: number;
    tournamentType?: TournamentRow["tournamentType"];
  }
): TournamentRow[] {
  return rows.filter((r) => {
    if (opts?.afterTimestamp != null && r.date < opts.afterTimestamp) return false;
    if (opts?.beforeTimestamp != null && r.date > opts.beforeTimestamp) return false;
    if (opts?.tournamentType != null && r.tournamentType !== opts.tournamentType) return false;
    return true;
  });
}

/** Agrega um array de `TournamentRow` em NetworkAggBucket por rede. */
export function aggregateRows(rows: TournamentRow[]): {
  byNetwork: Map<string, NetworkAggBucket>;
  byPlayer: Map<string, Map<string, NetworkAggBucket>>;
  totals: NetworkAggBucket;
} {
  const byNetwork = new Map<string, NetworkAggBucket>();
  const byPlayer = new Map<string, Map<string, NetworkAggBucket>>();
  const totals = emptyNetworkAggBucket();

  for (const r of rows) {
    const netKey = r.networkKey;
    if (!netKey) continue;

    const cashed = r.prize > 0.005;
    const { early, late } = classifyFinish(r.position, r.entrants);
    const itmHit = cashed ? 1 : 0;
    const invested = r.investment > 0 ? r.investment : r.stake + r.rake;
    const delta = {
      profit: r.prize,
      stake: invested,
      entries: 1,
      itmHits: itmHit,
      earlyHits: early ? 1 : 0,
      lateHits: late ? 1 : 0,
    };

    bumpBucket(byNetwork, netKey, delta);
    addToBucket(totals, delta);

    if (r.playerName) {
      const pk = r.playerName.toLowerCase();
      if (!byPlayer.has(pk)) byPlayer.set(pk, new Map());
      bumpBucket(byPlayer.get(pk)!, netKey, delta);
    }
  }

  return { byNetwork, byPlayer, totals };
}

/** Computa stats-like a partir de TournamentRow[]: roi, earlyFinish, lateFinish, etc. */
export function computeStatsFromRows(rows: TournamentRow[]): {
  count: number;
  entries: number;
  totalProfit: number;
  totalStake: number;
  totalRoi: number | null;
  itm: number | null;
  earlyFinish: number | null;
  lateFinish: number | null;
  avStake: number | null;
} {
  const { totals } = aggregateRows(rows);
  return {
    count: rows.length,
    entries: totals.entries,
    totalProfit: totals.profit,
    totalStake: totals.stake,
    totalRoi: roiFromAgg(totals),
    itm: pctFromRatio(totals.itmHits, totals.entries),
    earlyFinish: pctFromRatio(totals.earlyHits, totals.entries),
    lateFinish: pctFromRatio(totals.lateHits, totals.entries),
    avStake: totals.entries > 0 ? totals.stake / totals.entries : null,
  };
}
