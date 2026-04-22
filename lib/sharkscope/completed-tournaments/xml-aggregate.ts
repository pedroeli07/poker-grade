import type { NetworkAggBucket, TournamentRow } from "@/lib/types/sharkscope/completed-tournaments";
import type { AggregateCompletedTournamentsFullResult } from "@/lib/types/sharkscope/aggregate";
import { bumpBucket, parseNum } from "./bucket-utils";
import { classifyTournamentType } from "./classify-tournament-type";
import { classifyFinish } from "./finish-classify";
import { sharkscopeNetworkToAppKey } from "./network-map";

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

function recordSkippedUnknown(
  netRaw: string,
  skippedUnknownNetworks: Map<string, number> | undefined
) {
  if (skippedUnknownNetworks) {
    skippedUnknownNetworks.set(netRaw, (skippedUnknownNetworks.get(netRaw) ?? 0) + 1);
  }
}

function buildTournamentRow(
  tournament: Record<string, unknown>,
  entry: Record<string, unknown>,
  netRaw: string,
  appKey: string,
  stake: number,
  rake: number,
  investment: number,
  profit: number,
  position: number,
  entrants: number,
  nameRaw: string | undefined
): TournamentRow {
  const flags = typeof tournament["@flags"] === "string" ? tournament["@flags"] : "";
  return {
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
  };
}

function applyBucketsForEntry(
  appKey: string,
  profit: number,
  investment: number,
  itmHit: number,
  early: boolean,
  late: boolean,
  byNetwork: Map<string, NetworkAggBucket>,
  byPlayer: Map<string, Map<string, NetworkAggBucket>>,
  nameRaw: string | undefined
) {
  const delta = {
    profit,
    stake: investment,
    entries: 1,
    itmHits: itmHit,
    earlyHits: early ? 1 : 0,
    lateHits: late ? 1 : 0,
  };
  bumpBucket(byNetwork, appKey, delta);

  if (typeof nameRaw === "string" && nameRaw.trim()) {
    const pk = nameRaw.trim().toLowerCase();
    if (!byPlayer.has(pk)) byPlayer.set(pk, new Map());
    bumpBucket(byPlayer.get(pk)!, appKey, delta);
  }
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
    recordSkippedUnknown(netRaw, skippedUnknownNetworks);
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
  const nameRaw = entry["@playerName"];

  applyBucketsForEntry(
    appKey,
    profit,
    investment,
    itmHit,
    early,
    late,
    byNetwork,
    byPlayer,
    typeof nameRaw === "string" ? nameRaw : undefined
  );

  if (rows) {
    rows.push(
      buildTournamentRow(
        tournament,
        entry,
        netRaw,
        appKey,
        stake,
        rake,
        investment,
        profit,
        position,
        entrants,
        typeof nameRaw === "string" ? nameRaw : undefined
      )
    );
  }

  return true;
}

function tournamentEntriesList(r: Record<string, unknown>): Record<string, unknown>[] {
  if (r.TournamentEntry == null) return [];
  const te = r.TournamentEntry;
  if (Array.isArray(te)) {
    return te.filter((x): x is Record<string, unknown> => x != null && typeof x === "object");
  }
  if (te != null && typeof te === "object") return [te as Record<string, unknown>];
  return [];
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

  const entries = tournamentEntriesList(r);
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
): AggregateCompletedTournamentsFullResult {
  const byNetwork = new Map<string, NetworkAggBucket>();
  const byPlayer = new Map<string, Map<string, NetworkAggBucket>>();
  const tournamentCount = { n: 0 };
  const rows: TournamentRow[] = [];
  const skippedUnknownNetworks = new Map<string, number>();
  walk(raw, byNetwork, byPlayer, tournamentCount, collectRows ? rows : undefined, skippedUnknownNetworks);
  return { byNetwork, byPlayer, tournamentRows: tournamentCount.n, rows, skippedUnknownNetworks };
}
