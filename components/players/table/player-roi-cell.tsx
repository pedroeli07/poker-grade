"use client";

import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { memo } from "react";

const roiClass =
  "inline-flex flex-row items-center gap-1.5 tabular-nums px-2.5 py-1 rounded-md border text-xs font-bold";
const roiIconClass = "h-3.5 w-3.5 shrink-0";

function roiValue(roi: number) {
  return `${roi.toFixed(1)}%`;
}

const PlayerRoiCell = memo(function PlayerRoiCell({ roi }: { roi: number | null }) {
  if (roi === null) return <span className="text-muted-foreground text-xs">—</span>;
  if (roi < -40) {
    return (
      <span className={`${roiClass} bg-red-500/10 text-red-600 border-red-500/20`}>
        <TrendingDown className={roiIconClass} />
        <span>{roiValue(roi)}</span>
      </span>
    );
  }
  if (roi < -20) {
    return (
      <span className={`${roiClass} bg-amber-500/10 text-amber-600 border-amber-500/20`}>
        <TrendingDown className={roiIconClass} />
        <span>{roiValue(roi)}</span>
      </span>
    );
  }
  if (roi >= 0) {
    return (
      <span className={`${roiClass} bg-emerald-500/10 text-emerald-600 border-emerald-500/20`}>
        <TrendingUp className={roiIconClass} />
        <span>+{roiValue(roi)}</span>
      </span>
    );
  }
  return (
    <span className={`${roiClass} bg-muted text-muted-foreground border-border/50`}>
      <Minus className={roiIconClass} />
      <span>{roiValue(roi)}</span>
    </span>
  );
});

PlayerRoiCell.displayName = "PlayerRoiCell";

export default PlayerRoiCell;
