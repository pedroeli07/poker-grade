"use client";

import { memo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { PlayerDataRowProps } from "@/lib/types";
import PlayerAbiTableCell from "@/components/players/table/player-coach-grade-abi-cells";
import PlayerCoachTableCell from "@/components/players/table/player-coach-table-cell";
import PlayerGradeTableCell from "@/components/players/table/player-grade-table-cell";
import PlayerFpTenDayCell from "@/components/players/table/player-fp-cells";
import PlayerFtTenDayCell from "@/components/players/table/player-ft-cells";
import PlayerGroupTableCell from "@/components/players/table/player-group-table-cell";
import PlayerNicksTableCell from "@/components/players/table/player-nicks-table-cell";
import PlayerRoiCell from "@/components/players/table/player-roi-cell";
import PlayerStatusTableCell from "@/components/players/table/player-status-table-cell";
import PlayerTableRowActions from "@/components/players/table/player-table-row-actions";

export const badgeClassName = "inline-flex h-8 max-w-full items-center border-primary/20 bg-primary/5 px-1.5 py-0 text-[14px] shadow-blue-500/50 hover:bg-blue-500/20 hover:shadow-blue-500 shadow-lg hover:shadow-lg leading-none text-primary"

const PlayerTableRow = memo(function PlayerTableRow({
  player,
  canEditPlayers,
  onEdit,
}: PlayerDataRowProps) {
  return (
    <TableRow className="hover:bg-sidebar-accent/50">
      <TableCell className="w-[9%] min-w-0 py-3 align-middle font-medium text-[15px]" title={player.name}>
        <div className="flex min-h-[1.5rem] w-full min-w-0 items-center justify-center">
          <Badge variant="outline" className={badgeClassName}>
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
      <TableCell className="w-[19%] min-w-0 whitespace-normal py-3 align-middle text-center">
        <div className="flex w-full min-w-0 items-center justify-center">
          <PlayerNicksTableCell nicks={player.nicks} />
        </div>
      </TableCell>
      <TableCell
        className="w-[12%] min-w-0 whitespace-normal py-3 align-middle text-center"
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
      <TableCell className="w-[8%] min-w-0 px-0.5 py-3 text-center align-middle">
        <div className="flex min-h-[1.5rem] items-center justify-center">
          <PlayerRoiCell roi={player.roiTenDay} />
        </div>
      </TableCell>
      <TableCell className="w-[8%] min-w-0 px-0.5 py-3 text-center align-middle">
        <div className="flex min-h-[1.5rem] items-center justify-center">
          <PlayerFpTenDayCell value={player.fpTenDay} />
        </div>
      </TableCell>
      <TableCell className="w-[8%] min-w-0 px-0.5 py-3 text-center align-middle">
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