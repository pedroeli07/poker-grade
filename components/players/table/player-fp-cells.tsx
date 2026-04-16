"use client";

import { memo } from "react";
import type { PlayerFpTenDayCellProps } from "@/lib/types/player";
import { playersTableFpTenDayClassName } from "@/lib/utils/player";

const PlayerFpTenDayCell = memo(function PlayerFpTenDayCell({ value }: PlayerFpTenDayCellProps) {
  if (value === null) return <span className="text-muted-foreground text-xs">—</span>;
  return <span className={playersTableFpTenDayClassName(value)}>{value.toFixed(1)}%</span>;
});

PlayerFpTenDayCell.displayName = "PlayerFpTenDayCell";

export default PlayerFpTenDayCell;
