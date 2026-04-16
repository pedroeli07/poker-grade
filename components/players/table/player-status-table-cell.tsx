"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import {
  PLAYER_TABLE_STATUS_ACTIVE_BADGE_CLASS,
  PLAYER_TABLE_STATUS_INACTIVE_BADGE_CLASS,
  PLAYER_TABLE_STATUS_LABEL,
  PLAYER_TABLE_STATUS_SUSPENDED_BADGE_CLASS,
} from "@/lib/constants/players-table-ui";
import { playersTableCol } from "@/lib/constants/classes";
import type { PlayerStatusTableCellProps } from "@/lib/types/player";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { PlayerStatus } from "@prisma/client";

const PlayerStatusTableCell = memo(function PlayerStatusTableCell({ status }: PlayerStatusTableCellProps) {
  const label = PLAYER_TABLE_STATUS_LABEL[status];
  return (
    <TableCell className={cn(playersTableCol.status, "whitespace-normal py-3 text-center align-middle")}>
      <div className="flex h-full min-h-[1.5rem] items-center justify-center">
        {status === PlayerStatus.ACTIVE ? (
          <Badge className={PLAYER_TABLE_STATUS_ACTIVE_BADGE_CLASS}>{label}</Badge>
        ) : status === PlayerStatus.SUSPENDED ? (
          <Badge className={PLAYER_TABLE_STATUS_SUSPENDED_BADGE_CLASS}>{label}</Badge>
        ) : (
          <Badge variant="secondary" className={PLAYER_TABLE_STATUS_INACTIVE_BADGE_CLASS}>
            {label}
          </Badge>
        )}
      </div>
    </TableCell>
  );
});

PlayerStatusTableCell.displayName = "PlayerStatusTableCell";

export default PlayerStatusTableCell;
