"use client";

import { memo } from "react";
import type { PlayerFtTenDayCellProps } from "@/lib/types/player";
import { playersTableFtTenDayClassName } from "@/lib/utils/player";

const PlayerFtTenDayCell = memo(function PlayerFtTenDayCell({ value }: PlayerFtTenDayCellProps) {
  if (value === null) return <span className="text-muted-foreground text-xs">—</span>;
  return <span className={playersTableFtTenDayClassName(value)}>{value.toFixed(1)}%</span>;
});

PlayerFtTenDayCell.displayName = "PlayerFtTenDayCell";

export default PlayerFtTenDayCell;
