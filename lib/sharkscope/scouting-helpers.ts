import { extractStat } from "@/lib/sharkscope-parse";

export type ScoutingSearchStats = {
  roi: number | null;
  profit: number | null;
  count: number | null;
  abi: number | null;
  entrants: number | null;
};

export function parseScoutingSearchPayload(
  raw: Record<string, unknown> | null
): ScoutingSearchStats {
  if (!raw) {
    return {
      roi: null,
      profit: null,
      count: null,
      abi: null,
      entrants: null,
    };
  }
  return {
    roi: extractStat(raw, "AvROI"),
    profit: extractStat(raw, "TotalProfit"),
    count: extractStat(raw, "Count"),
    abi: extractStat(raw, "AvStake"),
    entrants: extractStat(raw, "AvEntrants"),
  };
}

export function parseScoutingSavedRaw(rawData: unknown): ScoutingSearchStats {
  if (!rawData || typeof rawData !== "object") {
    return parseScoutingSearchPayload(null);
  }
  return parseScoutingSearchPayload(rawData as Record<string, unknown>);
}
