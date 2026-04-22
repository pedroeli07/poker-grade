import type { NetworkAggBucket } from "@/lib/types/sharkscope/completed-tournaments";

export function parseNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const x = parseFloat(v.replace(",", "."));
    return Number.isFinite(x) ? x : 0;
  }
  return 0;
}

export function parseBucket(o: Record<string, unknown>): NetworkAggBucket {
  return {
    profit: parseNum(o.profit),
    stake: parseNum(o.stake),
    entries: parseNum(o.entries),
    itmHits: parseNum(o.itmHits),
    earlyHits: parseNum(o.earlyHits),
    lateHits: parseNum(o.lateHits),
  };
}

export function emptyNetworkAggBucket(): NetworkAggBucket {
  return { profit: 0, stake: 0, entries: 0, itmHits: 0, earlyHits: 0, lateHits: 0 };
}

export function addToBucket(
  b: NetworkAggBucket,
  delta: Partial<NetworkAggBucket> & { profit?: number; stake?: number; entries?: number }
) {
  b.profit += delta.profit ?? 0;
  b.stake += delta.stake ?? 0;
  b.entries += delta.entries ?? 0;
  b.itmHits += delta.itmHits ?? 0;
  b.earlyHits += delta.earlyHits ?? 0;
  b.lateHits += delta.lateHits ?? 0;
}

export function bumpBucket(
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
