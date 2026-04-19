"use client";

import { memo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { PlayerDataRowProps } from "@/lib/types";
import { playersTableCol, playerTableBadgeClassName } from "@/lib/constants/classes";
import {
  PlayerAbiTableCell,
  PlayerCoachTableCell, 
  PlayerGradeTableCell, 
  PlayerFpTenDayCell, 
  PlayerFtTenDayCell, 
  PlayerGroupTableCell, 
  PlayerNicksTableCell, 
  PlayerRoiCell, 
  PlayerStatusTableCell, 
  PlayerTableRowActions } from "./table";
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
          <Badge
            variant="outline"
            className={cn(playerTableBadgeClassName, "gap-1.5 pl-1 pr-2")}
          >
            <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-[9px] font-semibold leading-none transition-transform duration-300 hover:scale-[4] hover:z-50 hover:shadow-xl hover:border-primary/30">
              {player.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                player.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0] ?? "")
                  .join("")
                  .toUpperCase()
              )}
            </div>
            <span className="min-w-0 truncate font-medium">{player.name}</span>
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