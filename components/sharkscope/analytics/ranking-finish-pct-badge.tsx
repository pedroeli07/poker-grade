"use client";

import { memo } from "react";
import { earlyFinishSeverity, lateFinishSeverity } from "@/lib/sharkscope-parse";
import { analyticsStatPillClass } from "@/lib/constants/classes";
import { analyticsFinishSeverityBadgeClass } from "@/lib/utils/sharlscope/analytics/analytics-cells-display";

/** Finalização precoce / tardia — mesmos limiares dos alertas (`earlyFinishSeverity` / `lateFinishSeverity`). */
const RankingFinishPctBadge = memo(function RankingFinishPctBadge({
  kind,
  pct,
}: {
  kind: "early" | "late";
  pct: number | null;
}) {
  if (pct === null) return <span className="text-muted-foreground text-xs">—</span>;
  const sev = kind === "early" ? earlyFinishSeverity(pct) : lateFinishSeverity(pct);
  const label = `${pct.toFixed(1)}%`;
  const colorClass = analyticsFinishSeverityBadgeClass(sev);
  return <span className={`${analyticsStatPillClass} ${colorClass}`}>{label}</span>;
});

RankingFinishPctBadge.displayName = "RankingFinishPctBadge";

export default RankingFinishPctBadge;