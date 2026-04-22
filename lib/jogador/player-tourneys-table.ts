import type { PlayerTourneyRow } from "@/lib/data/minha-grade-tourneys";
import { PLAYER_TOURNEYS_WEEKDAY_PT } from "@/lib/constants/jogador";
import type { PlayerTourneysFilterState, PlayerTourneysSort } from "@/lib/types/jogador";
import { cn } from "@/lib/utils/cn";
import { schedulingCategory } from "@/lib/utils/player";
export function formatPlayerTourneyDateParts(d: Date) {
  const wd = PLAYER_TOURNEYS_WEEKDAY_PT[d.getDay()];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return { weekday: wd, date: `${dd}/${mm}/${yyyy}`, time: `${hh}:${mi}` };
}

export function formatBuyInFilterKey(r: Pick<PlayerTourneyRow, "buyInCurrency" | "buyInValue">) {
  return `${r.buyInCurrency ?? ""}${Number.isFinite(r.buyInValue) ? r.buyInValue.toFixed(2) : "—"}`;
}

export function nextPlayerTourneysSort(prev: PlayerTourneysSort, key: string): PlayerTourneysSort {
  if (prev?.key === key) return prev.dir === "asc" ? { key, dir: "desc" } : null;
  return { key, dir: "asc" };
}

export function buildPlayerTourneysFilterOptions(rows: PlayerTourneyRow[]) {
  const sites = new Set<string>();
  const speeds = new Set<string>();
  const priorities = new Set<string>();
  const dates = new Set<string>();
  const buyIns = new Set<string>();
  const tourneys = new Set<string>();
  const sharkIds = new Set<string>();
  const rebuys = new Set<number>();

  for (const r of rows) {
    if (r.site) sites.add(r.site);
    if (r.speed) speeds.add(r.speed);
    if (r.priority) priorities.add(r.priority);
    dates.add(formatPlayerTourneyDateParts(new Date(r.date)).date);
    buyIns.add(formatBuyInFilterKey(r));
    if (r.tournamentName) tourneys.add(r.tournamentName);
    if (r.sharkId) sharkIds.add(r.sharkId);
    rebuys.add(r.rebuys ?? 0);
  }

  return {
    site: Array.from(sites)
      .sort()
      .map((s) => ({ value: s, label: s })),
    scheduling: [
      { value: "played", label: "Played" },
      { value: "extra", label: "Extra play" },
      { value: "missed", label: "Didn't play" },
    ],
    speed: Array.from(speeds)
      .sort()
      .map((s) => ({ value: s, label: s })),
    priority: Array.from(priorities)
      .sort()
      .map((s) => ({ value: s, label: s })),
    rebuy: Array.from(rebuys)
      .sort((a, b) => a - b)
      .map((n) => ({ value: String(n), label: n === 0 ? "Sem reentry" : String(n) })),
    date: Array.from(dates)
      .sort()
      .map((s) => ({ value: s, label: s })),
    buyIn: Array.from(buyIns)
      .sort()
      .map((s) => ({ value: s, label: s })),
    tournamentName: Array.from(tourneys)
      .sort()
      .map((s) => ({ value: s, label: s })),
    sharkId: Array.from(sharkIds)
      .sort()
      .map((s) => ({ value: s, label: s })),
  };
}

export function filterPlayerTourneyRows(rows: PlayerTourneyRow[], f: PlayerTourneysFilterState) {
  const q = f.search.trim().toLowerCase();
  return rows.filter((r) => {
    const cat = schedulingCategory(r.scheduling);
    if (f.schedulingFilter && !f.schedulingFilter.has(cat)) return false;
    if (f.siteFilter && !f.siteFilter.has(r.site)) return false;
    if (f.speedFilter && !f.speedFilter.has(r.speed ?? "")) return false;
    if (f.priorityFilter && !f.priorityFilter.has(r.priority ?? "")) return false;
    if (f.rebuyFilter && !f.rebuyFilter.has(String(r.rebuys ?? 0))) return false;
    const { date } = formatPlayerTourneyDateParts(new Date(r.date));
    if (f.dateFilter && !f.dateFilter.has(date)) return false;
    const bi = formatBuyInFilterKey(r);
    if (f.buyInFilter && !f.buyInFilter.has(bi)) return false;
    if (f.tourneyFilter && !f.tourneyFilter.has(r.tournamentName)) return false;
    if (f.sharkIdFilter && !f.sharkIdFilter.has(r.sharkId ?? "")) return false;
    if (!q) return true;
    return (
      r.tournamentName.toLowerCase().includes(q) ||
      r.site.toLowerCase().includes(q) ||
      (r.sharkId ?? "").toLowerCase().includes(q)
    );
  });
}

function sortComparable(a: PlayerTourneyRow, b: PlayerTourneyRow, key: string): [string | number, string | number] {
  let va: string | number;
  let vb: string | number;
  switch (key) {
    case "date":
      va = new Date(a.date).getTime();
      vb = new Date(b.date).getTime();
      break;
    case "site":
      va = a.site;
      vb = b.site;
      break;
    case "buyIn":
      va = a.buyInValue ?? 0;
      vb = b.buyInValue ?? 0;
      break;
    case "tournamentName":
      va = a.tournamentName;
      vb = b.tournamentName;
      break;
    case "scheduling":
      va = schedulingCategory(a.scheduling);
      vb = schedulingCategory(b.scheduling);
      break;
    case "rebuy":
      va = a.rebuys ?? 0;
      vb = b.rebuys ?? 0;
      break;
    case "speed":
      va = a.speed ?? "";
      vb = b.speed ?? "";
      break;
    case "sharkId":
      va = a.sharkId ?? "";
      vb = b.sharkId ?? "";
      break;
    case "priority":
      va = a.priority ?? "";
      vb = b.priority ?? "";
      break;
    default:
      va = 0;
      vb = 0;
  }
  return [va, vb];
}

export function sortPlayerTourneyRows(rows: PlayerTourneyRow[], sort: PlayerTourneysSort) {
  if (!sort) return rows;
  return [...rows].sort((a, b) => {
    const [va, vb] = sortComparable(a, b, sort.key);
    if (va < vb) return sort.dir === "asc" ? -1 : 1;
    if (va > vb) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });
}

export function countPlayerTourneyScheduling(rows: PlayerTourneyRow[]) {
  let played = 0;
  let extra = 0;
  let missed = 0;
  for (const r of rows) {
    const c = schedulingCategory(r.scheduling);
    if (c === "played") played++;
    else if (c === "extra") extra++;
    else missed++;
  }
  return { played, extra, missed, total: rows.length };
}

export function speedPillClassName(speed: string | null) {
  return cn(
    "inline-block px-2 py-0.5 rounded-full border border-border",
    speed === "Turbo"
      ? "bg-violet-900 text-violet-200"
      : speed === "Regular"
        ? "bg-violet-700 text-violet-200"
        : speed === "Slow"
          ? "bg-violet-400 text-white"
          : speed === "Hyper-Turbo"
            ? "bg-violet-200 text-violet-900"
            : "bg-muted text-foreground"
  );
}
