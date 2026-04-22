import { LOBBYZE_SITE_NAME_STRIP_TOKENS } from "@/lib/constants/lobbyze-filters";
import type { LobbyzeFilterItem } from "@/lib/types/lobbyzeTypes";
export const normText = (t: string) => t.toLowerCase().trim();

export const isTextSelected = (list: LobbyzeFilterItem[], opt: LobbyzeFilterItem) =>
  list.some((x) => normText(x.item_text) === normText(opt.item_text));

export const toggleByText = (list: LobbyzeFilterItem[], opt: LobbyzeFilterItem, on: boolean) =>
  on ? [...list, opt] : list.filter((x) => normText(x.item_text) !== normText(opt.item_text));

export function mergeOptions(presets: LobbyzeFilterItem[], current: LobbyzeFilterItem[]): LobbyzeFilterItem[] {
  const m = new Map<string, LobbyzeFilterItem>();
  for (const item of [...presets, ...current]) {
    m.set(normText(item.item_text), item);
  }
  return [...m.values()].sort((a, b) => a.item_text.localeCompare(b.item_text));
}

export const formatList = (jsonObj: unknown): string => {
  if (!jsonObj) return "Todos";
  try {
    const arr = typeof jsonObj === "string" ? JSON.parse(jsonObj) : jsonObj;
    if (!Array.isArray(arr) || arr.length === 0) return "Todos";
    return (arr as LobbyzeFilterItem[]).map((i) => i.item_text).join(", ");
  } catch {
    return "Todos";
  }
};

export const formatBuyIn = (min: number | null, max: number | null) => {
  if (min === null && max === null) return "Qualquer";
  if (min !== null && max === null) return `+$${min}`;
  if (min === null && max !== null) return `Até $${max}`;
  return `$${min} - $${max}`;
};

export function matchesExcludePattern(name: string, pattern: string): boolean {
  if (!pattern) return false;
  const lower = name.toLowerCase();
  const parts = pattern.split("|");
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i].trim().toLowerCase();
    if (p && lower.includes(p)) return true;
  }
  return false;
}

export function matchesSpeed(speed: string | undefined, ruleSpeed: LobbyzeFilterItem[] | null): boolean {
  if (!ruleSpeed || ruleSpeed.length === 0) return true;
  if (!speed) return false;
  const sl = speed.toLowerCase();
  for (const s of ruleSpeed) {
    if (s.item_text.toLowerCase() === sl) return true;
  }
  return false;
}

export function normalizeSiteName(name: string): string {
  let s = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const tok of LOBBYZE_SITE_NAME_STRIP_TOKENS) s = s.replace(tok, "");
  return s;
}
