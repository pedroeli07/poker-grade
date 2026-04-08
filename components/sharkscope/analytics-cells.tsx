"use client";

import { memo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export const AnalyticsRoiBadge = memo(function AnalyticsRoiBadge({
  roi,
}: {
  roi: number | null;
}) {
  if (roi === null)
    return <span className="text-muted-foreground text-xs">—</span>;
  if (roi < -40)
    return (
      <span className="flex items-center gap-1 text-red-500 font-semibold text-sm">
        <TrendingDown className="h-3.5 w-3.5" />
        {roi.toFixed(1)}%
      </span>
    );
  if (roi < -20)
    return (
      <span className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
        <TrendingDown className="h-3.5 w-3.5" />
        {roi.toFixed(1)}%
      </span>
    );
  if (roi >= 0)
    return (
      <span className="flex items-center gap-1 text-emerald-500 font-semibold text-sm">
        <TrendingUp className="h-3.5 w-3.5" />
        +{roi.toFixed(1)}%
      </span>
    );
  return (
    <span className="text-muted-foreground font-semibold text-sm">
      {roi.toFixed(1)}%
    </span>
  );
});

export const AnalyticsProfitCell = memo(function AnalyticsProfitCell({
  profit,
}: {
  profit: number | null;
}) {
  if (profit === null)
    return <span className="text-muted-foreground text-xs">—</span>;
  const sign = profit >= 0 ? "+" : "";
  return (
    <span
      className={`font-mono text-sm font-semibold ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}
    >
      {sign}${profit.toFixed(0)}
    </span>
  );
});
