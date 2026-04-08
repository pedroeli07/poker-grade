"use client";

import { memo, type ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export const ScoutingStatCard = memo(function ScoutingStatCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
});

export const ScoutingRoiDisplay = memo(function ScoutingRoiDisplay({
  roi,
}: {
  roi: number | null;
}) {
  if (roi === null) return <span className="text-muted-foreground">—</span>;
  const color =
    roi < -40
      ? "text-red-500"
      : roi < -20
        ? "text-amber-500"
        : roi >= 0
          ? "text-emerald-500"
          : "text-foreground";
  const Icon = roi >= 0 ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center justify-center gap-1 ${color} font-bold`}>
      <Icon className="h-4 w-4" />
      {roi >= 0 ? "+" : ""}
      {roi.toFixed(1)}%
    </span>
  );
});
