import type { LucideIcon } from "lucide-react";
import { Globe, Layers, Trophy, Zap } from "lucide-react";
import type { SharkscopeAnalyticsPeriod, SharkscopeAnalyticsTab } from "@/lib/types";

export const SHARKSCOPE_ANALYTICS_PERIODS: readonly SharkscopeAnalyticsPeriod[] = ["30d", "90d"];

const TAB_ROWS = [
  ["site", Globe, "Por Site"],
  ["ranking", Trophy, "Ranking (30d)"],
  ["tier", Layers, "Por TIER"],
  ["bounty", Zap, "Bounty vs Vanilla"],
] as const satisfies readonly (readonly [SharkscopeAnalyticsTab, LucideIcon, string])[];

export const TAB_ICONS = Object.fromEntries(TAB_ROWS.map(([id, Icon]) => [id, Icon])) as Record<
  SharkscopeAnalyticsTab,
  LucideIcon
>;

export const TAB_IDS = TAB_ROWS.map(([id]) => id);

export const SHARKSCOPE_ANALYTICS_TAB_LABELS: Record<string, string> = Object.fromEntries(
  TAB_ROWS.map(([id, , label]) => [id, label]),
);
