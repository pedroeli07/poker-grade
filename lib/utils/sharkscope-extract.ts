import {
  SHARKSCOPE_EMPTY_SCOUTING_STATS,
  SHARKSCOPE_SCOUTING_STAT_EXTRACTS,
  SHARKSCOPE_STAT_CONTAINER_PATHS,
  SHARKSCOPE_STAT_ID_EXTRA_ALIASES,
} from "@/lib/constants/sharkscope/stat-extract";
import {
  type NetworkStat,
  type ScoutingSearchStats,
  type SharkscopeAlertFilters,
  type SharkscopeAlertRow,
  type StatisticJson,
} from "@/lib/types";
import type { SharkscopeAnalyticsPeriod } from "@/lib/types/sharkscope/analytics";
import { lookupSharkscopeStat, parseSharkscopeStatisticNode } from "@/lib/sharkscope-stat-scan";

function dig(obj: Record<string, unknown>, ...keys: string[]): unknown {
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

function getStatArray(raw: unknown): StatisticJson[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  if ("Statistic" in obj) {
    const st = obj.Statistic;
    return Array.isArray(st)
      ? (st as StatisticJson[])
      : st && typeof st === "object"
        ? [st as StatisticJson]
        : [];
  }
  return Array.isArray(raw) ? (raw as StatisticJson[]) : [];
}

function statisticIdLower(s: StatisticJson): string | undefined {
  const raw = s["@name"] ?? s["@id"] ?? s.id ?? s.name;
  if (typeof raw !== "string") return undefined;
  return raw.trim().toLowerCase().replace(/\s/g, "");
}

function buildStatAliases(want: string): Set<string> {
  const aliases = new Set<string>();
  aliases.add(want);
  const extra = SHARKSCOPE_STAT_ID_EXTRA_ALIASES[want];
  if (extra) {
    for (const a of extra) aliases.add(a);
  }
  return aliases;
}

/** Percorre caminhos na ordem definida e devolve o primeiro `Statistic` cujo id casa com `aliases`. */
function findFirstMatchingStatistic(
  root: Record<string, unknown>,
  aliases: Set<string>
): StatisticJson | undefined {
  for (const path of SHARKSCOPE_STAT_CONTAINER_PATHS) {
    const stats = dig(root, ...(path as unknown as string[]));
    if (stats == null) continue;
    const arr = getStatArray(stats);
    for (const s of arr) {
      const lowerRaw = statisticIdLower(s);
      if (lowerRaw && aliases.has(lowerRaw)) return s;
    }
  }
  return undefined;
}

export function extractStat(rawData: unknown, statName: string): number | null {
  if (!rawData || typeof rawData !== "object") return null;
  const root = rawData as Record<string, unknown>;
  const want = statName.toLowerCase().replace(/\s/g, "");
  const aliases = buildStatAliases(want);

  const found = findFirstMatchingStatistic(root, aliases);
  if (found) {
    const n = parseSharkscopeStatisticNode(found as unknown as Record<string, unknown>);
    if (n !== null) return n;
  }
  return lookupSharkscopeStat(rawData, statName);
}

export function extractRemainingSearches(rawData: unknown): number | null {
  if (!rawData || typeof rawData !== "object") return null;
  const root = rawData as Record<string, unknown>;
  const r =
    dig(root, "Response", "UserInfo", "RemainingSearches") ?? dig(root, "Response", "RemainingSearches");
  if (r == null) return null;
  if (typeof r === "number") return r;
  const v = typeof r === "object" ? (r as Record<string, unknown>)["$"] : r;
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}

export function parseScoutingSearchPayload(raw: Record<string, unknown> | null): ScoutingSearchStats {
  if (!raw) return SHARKSCOPE_EMPTY_SCOUTING_STATS;
  const out: ScoutingSearchStats = { ...SHARKSCOPE_EMPTY_SCOUTING_STATS };
  for (const [k, name] of SHARKSCOPE_SCOUTING_STAT_EXTRACTS) {
    out[k] = extractStat(raw, name);
  }
  return out;
}

export const parseScoutingSavedRaw = (rawData: unknown): ScoutingSearchStats =>
  parseScoutingSearchPayload(
    rawData && typeof rawData === "object" ? (rawData as Record<string, unknown>) : null
  );

export const sharkscopeStatsHasData = (stats: NetworkStat[]) =>
  stats.some((s) => s.roi !== null || s.profit !== null);

export const pickSharkscopeStatsByPeriod = (
  period: SharkscopeAnalyticsPeriod,
  stats30d: NetworkStat[],
  stats90d: NetworkStat[]
) => (period === "30d" ? stats30d : stats90d);

import type { NumberFilterValue } from "@/lib/number-filter";

function checkNumberFilter(val: number | null | undefined, filter: NumberFilterValue | null): boolean {
  if (!filter || val == null) return true;
  const num = val;
  if (filter.op === "in") return filter.values ? filter.values.includes(num) : true;
  if (filter.op === "eq") return filter.min !== null ? num === filter.min : true;
  if (filter.op === "gt") return filter.min !== null ? num > filter.min : true;
  if (filter.op === "lt") return filter.min !== null ? num < filter.min : true;
  if (filter.op === "gte") return filter.min !== null ? num >= filter.min : true;
  if (filter.op === "lte") return filter.min !== null ? num <= filter.min : true;
  if (filter.op === "between") {
    if (filter.min !== null && num < filter.min) return false;
    if (filter.max !== null && num > filter.max) return false;
    return true;
  }
  return true;
}

export function filterSharkscopeAlerts(
  alerts: SharkscopeAlertRow[],
  f: SharkscopeAlertFilters
): SharkscopeAlertRow[] {
  return alerts.filter((a) => {
    if (f.severity && !f.severity.has(a.severity)) return false;
    if (f.alertType && !f.alertType.has(a.alertType)) return false;
    if (f.player && !f.player.has(a.player.name)) return false;
    
    if (f.data && f.data.size > 0) {
      // just match the raw formatted date string prefix
      const datePrefix = a.triggeredAt.split("T")[0]; // works for ISO string
      let matchedData = false;
      for (const d of f.data) {
        if (a.triggeredAt.startsWith(d)) {
          matchedData = true;
          break;
        }
      }
      if (!matchedData) return false;
    }

    if (!checkNumberFilter(a.metricValue, f.valor)) return false;
    if (!checkNumberFilter(a.threshold, f.limite)) return false;

    if (f.ack) {
      if (a.acknowledged && !f.ack.has("acknowledged")) return false;
      if (!a.acknowledged && !f.ack.has("unacknowledged")) return false;
    }
    return true;
  });
}

export function countUnacknowledgedAlerts(alerts: SharkscopeAlertRow[]): number {
  let n = 0;
  for (const a of alerts) {
    if (!a.acknowledged) n++;
  }
  return n;
}
