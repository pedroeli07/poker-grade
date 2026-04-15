"use client";

import { memo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { PlayerDataRowProps } from "@/lib/types";
import { playersTableCol, playerTableBadgeClassName } from "@/lib/constants/classes";
import { PlayerAbiTableCell, PlayerCoachTableCell, PlayerGradeTableCell, PlayerFpTenDayCell, PlayerFtTenDayCell, PlayerGroupTableCell, PlayerNicksTableCell, PlayerRoiCell, PlayerStatusTableCell, PlayerTableRowActions } from "./table";
import { cn } from "@/lib/utils"; 

const PlayerTableRow = memo(function PlayerTableRow({
  player,
  canEditPlayers,
  onEdit,
}: PlayerDataRowProps) {
  return (
    <TableRow className="hover:bg-sidebar-accent/50">
      <TableCell
        className={cn(playersTableCol.name, "py-3 align-middle font-medium text-[15px]")}
        title={player.name}
      >
        <div className="flex min-h-[1.5rem] w-full min-w-0 items-center justify-center">
          <Badge variant="outline" className={playerTableBadgeClassName}>
            {player.name}
          </Badge>
        </div>
      </TableCell>
      {/*
      <TableCell
        className="w-[10%] min-w-0 truncate align-top text-[12px] text-muted-foreground"
        title={player.email || "Sem email"}
      >
        {player.email ? player.email : <span className="italic opacity-50">—</span>}
      </TableCell>
      */}
      <TableCell className={cn(playersTableCol.nicks, "whitespace-normal py-3 align-middle text-center")}>
        <div className="flex w-full min-w-0 items-center justify-center">
          <PlayerNicksTableCell nicks={player.nicks} />
        </div>
      </TableCell>
      <TableCell
        className={cn(playersTableCol.grupoShark, "whitespace-normal py-3 align-middle text-center")}
        title={player.playerGroup || "Sem grupo"}
      >
        <div className="flex min-h-[1.5rem] items-center justify-center">
          <PlayerGroupTableCell playerGroup={player.playerGroup} sharkGroupNotFound={player.sharkGroupNotFound} />
        </div>
      </TableCell>
      <PlayerStatusTableCell status={player.status} />
      <PlayerCoachTableCell coachKey={player.coachKey} coachLabel={player.coachLabel} />
      <PlayerGradeTableCell gradeKey={player.gradeKey} gradeLabel={player.gradeLabel} />
      <PlayerAbiTableCell abiKey={player.abiKey} abiLabel={player.abiLabel} />
      <TableCell className={cn(playersTableCol.roi, "py-3 text-center align-middle")}>
        <div className="flex min-h-[1.5rem] items-center justify-center">
          <PlayerRoiCell roi={player.roiTenDay} />
        </div>
      </TableCell>
      <TableCell className={cn(playersTableCol.fp, "py-3 text-center align-middle")}>
        <div className="flex min-h-[1.5rem] items-center justify-center">
          <PlayerFpTenDayCell value={player.fpTenDay} />
        </div>
      </TableCell>
      <TableCell className={cn(playersTableCol.ft, "py-3 text-center align-middle")}>
        <div className="flex min-h-[1.5rem] items-center justify-center">
          <PlayerFtTenDayCell value={player.ftTenDay} />
        </div>
      </TableCell>
      <PlayerTableRowActions player={player} canEditPlayers={canEditPlayers} onEdit={onEdit} />
    </TableRow>
  );
});

PlayerTableRow.displayName = "PlayerTableRow";

export default PlayerTableRow;