"use client";

import { memo } from "react";
import { analyticsStatPillClass, statBadgeEmerald, statBadgeRed } from "@/lib/constants/classes";
import { fmtProfitUsd } from "@/lib/utils/sharlscope/analytics/sharkscope-analytics-format";

/** Lucro em badge verde / vermelho (ex.: ranking SharkScope). */
const RankingProfitBadge = memo(function RankingProfitBadge({
  profit,
}: {
  profit: number | null;
}) {
  if (profit === null) return <span className="text-muted-foreground text-xs">—</span>;
  const label = fmtProfitUsd(profit);
  const colorClass = profit >= 0 ? statBadgeEmerald : statBadgeRed;
  return (
    <span className={`${analyticsStatPillClass} ${colorClass}`}>
      {label}
    </span>
  );
});

RankingProfitBadge.displayName = "RankingProfitBadge";

export default RankingProfitBadge;