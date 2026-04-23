import { BarChart3, CalendarDays, LayoutList } from "lucide-react";

export const RITUALS_PAGE_TABS = [
  { value: "lista", icon: LayoutList, label: "Lista" },
  { value: "calendario", icon: CalendarDays, label: "Calendário" },
  { value: "adesao", icon: BarChart3, label: "Dashboard de Adesão" },
] as const;

export type RitualsPageTab = (typeof RITUALS_PAGE_TABS)[number]["value"];

const VALID_TAB = new Set<string>(RITUALS_PAGE_TABS.map((t) => t.value));

/** Query `?tab=lista|calendario|adesao` — default `lista` omite o parâmetro (igual governança). */
export function parseRitualsPageTabParam(raw: string | null): RitualsPageTab {
  if (raw && VALID_TAB.has(raw)) return raw as RitualsPageTab;
  return "lista";
}
