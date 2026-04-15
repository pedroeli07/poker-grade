"use client";

import { memo } from "react";
import type { PlayerRoiCellProps } from "@/lib/types/playerComponents";
import {
  playersTableRoiBadgeClassNames,
  playersTableRoiDisplayText,
} from "@/lib/utils/player/player-table-display";

const PlayerRoiCell = memo(function PlayerRoiCell({ roi }: PlayerRoiCellProps) {
  if (roi === null) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className={playersTableRoiBadgeClassNames(roi)}>
      <span>{playersTableRoiDisplayText(roi)}</span>
    </span>
  );
});

PlayerRoiCell.displayName = "PlayerRoiCell";

export default PlayerRoiCell;
