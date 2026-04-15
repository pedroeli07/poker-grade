"use client";

import { memo } from "react";
import { analyticsProfitMonoBase, analyticsProfitNegativeClass, analyticsProfitPositiveClass } from "@/lib/constants/classes";

const AnalyticsProfitCell = memo(function AnalyticsProfitCell({
  profit,
}: {
  profit: number | null;
}) {
  if (profit === null) return <span className="text-muted-foreground text-xs">—</span>;
  const sign = profit >= 0 ? "+" : "";
  const tone = profit >= 0 ? analyticsProfitPositiveClass : analyticsProfitNegativeClass;
  return (
    <span className={`${analyticsProfitMonoBase} ${tone}`}>
      {sign}${profit.toFixed(0)}
    </span>
  );
});

AnalyticsProfitCell.displayName = "AnalyticsProfitCell";

export default AnalyticsProfitCell;
