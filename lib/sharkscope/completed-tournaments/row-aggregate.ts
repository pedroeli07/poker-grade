import type { NetworkAggBucket, TournamentRow } from "@/lib/types/sharkscope/completed-tournaments";
import type {
  AggregateRowsResult,
  ComputeStatsFromRowsResult,
  FilterTournamentRowsOpts,
} from "@/lib/types/sharkscope/aggregate";
import { addToBucket, bumpBucket, emptyNetworkAggBucket } from "./bucket-utils";
import { classifyFinish } from "./finish-classify";

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

export function filterTournamentRows(rows: TournamentRow[], opts?: FilterTournamentRowsOpts): TournamentRow[] {
  return rows.filter((r) => {
    if (opts?.afterTimestamp != null && r.date < opts.afterTimestamp) return false;
    if (opts?.beforeTimestamp != null && r.date > opts.beforeTimestamp) return false;
    if (opts?.tournamentType != null && r.tournamentType !== opts.tournamentType) return false;
    return true;
  });
}

/** Agrega um array de `TournamentRow` em NetworkAggBucket por rede. */
export function aggregateRows(rows: TournamentRow[]): AggregateRowsResult {
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
export function computeStatsFromRows(rows: TournamentRow[]): ComputeStatsFromRowsResult {
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
