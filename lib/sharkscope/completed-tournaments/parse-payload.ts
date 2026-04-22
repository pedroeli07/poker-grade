import type { GroupSiteBreakdownPayload, NetworkAggBucket, TournamentRow } from "@/lib/types/sharkscope/completed-tournaments";
import { classifyTournamentType } from "./classify-tournament-type";
import { parseBucket, parseNum } from "./bucket-utils";

function parseByNetworkFromRaw(bn: Record<string, unknown>): Record<string, NetworkAggBucket> {
  const byNetwork: Record<string, NetworkAggBucket> = {};
  for (const [k, val] of Object.entries(bn)) {
    if (!val || typeof val !== "object") continue;
    byNetwork[k] = parseBucket(val as Record<string, unknown>);
  }
  return byNetwork;
}

function parseByPlayerNickFromRaw(
  raw: Record<string, unknown>
): Record<string, Record<string, NetworkAggBucket>> | undefined {
  if (!raw.byPlayerNick || typeof raw.byPlayerNick !== "object") return undefined;
  const bp = raw.byPlayerNick as Record<string, unknown>;
  const byPlayerNick: Record<string, Record<string, NetworkAggBucket>> = {};
  for (const [pk, netObj] of Object.entries(bp)) {
    if (!netObj || typeof netObj !== "object") continue;
    const inner: Record<string, NetworkAggBucket> = {};
    for (const [nk, val] of Object.entries(netObj as Record<string, unknown>)) {
      if (!val || typeof val !== "object") continue;
      inner[nk] = parseBucket(val as Record<string, unknown>);
    }
    if (Object.keys(inner).length) byPlayerNick[pk] = inner;
  }
  return Object.keys(byPlayerNick).length ? byPlayerNick : undefined;
}

function parseTournamentRowRecord(tr: Record<string, unknown>): TournamentRow {
  const stake = parseNum(tr.stake);
  const rake = parseNum(tr.rake);
  const investment =
    typeof tr.investment === "number" && Number.isFinite(tr.investment) ? tr.investment : stake + rake;
  const flagsStr = typeof tr.flags === "string" ? tr.flags : "";
  return {
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
  };
}

function parseV3TournamentsArray(raw: Record<string, unknown>): TournamentRow[] {
  if (!Array.isArray(raw.tournaments)) return [];
  const out: TournamentRow[] = [];
  for (const t of raw.tournaments) {
    if (!t || typeof t !== "object") continue;
    out.push(parseTournamentRowRecord(t as Record<string, unknown>));
  }
  return out;
}

function readPayloadHeader(raw: Record<string, unknown>): {
  v: 1 | 2 | 3;
  groupName: string;
  filterBody: string;
  pagesFetched: number;
  tournamentRows: number;
  byNetwork: Record<string, NetworkAggBucket>;
} | null {
  const v = raw.v;
  if (v !== 1 && v !== 2 && v !== 3) return null;
  if (typeof raw.groupName !== "string") return null;
  if (typeof raw.filterBody !== "string") return null;
  if (typeof raw.byNetwork !== "object" || raw.byNetwork === null) return null;
  const bn = raw.byNetwork as Record<string, unknown>;
  return {
    v: v as 1 | 2 | 3,
    groupName: raw.groupName,
    filterBody: raw.filterBody,
    pagesFetched: typeof raw.pagesFetched === "number" ? raw.pagesFetched : 0,
    tournamentRows: typeof raw.tournamentRows === "number" ? raw.tournamentRows : 0,
    byNetwork: parseByNetworkFromRaw(bn),
  };
}

export function parseGroupSiteBreakdownPayload(raw: unknown): GroupSiteBreakdownPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const header = readPayloadHeader(r);
  if (!header) return null;

  const byPlayerNick = header.v === 2 || header.v === 3 ? parseByPlayerNickFromRaw(r) : undefined;

  if (header.v === 3) {
    return {
      v: 3,
      groupName: header.groupName,
      filterBody: header.filterBody,
      pagesFetched: header.pagesFetched,
      tournamentRows: header.tournamentRows,
      byNetwork: header.byNetwork,
      byPlayerNick,
      tournaments: parseV3TournamentsArray(r),
    };
  }

  return {
    v: header.v as 1 | 2,
    groupName: header.groupName,
    filterBody: header.filterBody,
    pagesFetched: header.pagesFetched,
    tournamentRows: header.tournamentRows,
    byNetwork: header.byNetwork,
    byPlayerNick,
  };
}
