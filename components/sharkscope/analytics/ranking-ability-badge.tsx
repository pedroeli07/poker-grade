"use client";

import { memo } from "react";
import { analyticsStatPillClass } from "@/lib/constants/classes";
import { analyticsAbilityBadgeClass } from "@/lib/utils/sharlscope/analytics/analytics-cells-display";

/** Capacidade (0–100): maior é melhor. */
const RankingAbilityBadge = memo(function RankingAbilityBadge({
  ability,
}: {
  ability: number | null;
}) {
  if (ability === null) return <span className="text-muted-foreground text-xs">—</span>;
  const n = Math.round(ability);
  const colorClass = analyticsAbilityBadgeClass(n);
  return <span className={`${analyticsStatPillClass} ${colorClass}`}>{n}</span>;
});

RankingAbilityBadge.displayName = "RankingAbilityBadge";

export default RankingAbilityBadge;