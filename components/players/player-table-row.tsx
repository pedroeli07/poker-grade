"use client";

import { memo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
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

const PlayerTableRow = memo(function PlayerTableRow({
  player,
  canEditPlayers,
  onEdit,
}: PlayerDataRowProps) {
  return (
    <TableRow className="hover:bg-sidebar-accent/50">
      <TableCell className="w-[11%] min-w-0 truncate align-top font-medium" title={player.name}>
        {player.name}
      </TableCell>
      <TableCell
        className="w-[10%] min-w-0 truncate align-top text-[12px] text-muted-foreground"
        title={player.email || "Sem email"}
      >
        {player.email ? player.email : <span className="italic opacity-50">—</span>}
      </TableCell>
      <TableCell className="w-[18%] min-w-0 whitespace-normal align-top">
        <PlayerNicksTableCell nicks={player.nicks} />
      </TableCell>
      <TableCell
        className="w-[12%] min-w-0 whitespace-normal align-top"
        title={player.playerGroup || "Sem grupo"}
      >
        <PlayerGroupTableCell playerGroup={player.playerGroup} sharkGroupNotFound={player.sharkGroupNotFound} />
      </TableCell>
      <PlayerCoachTableCell coachKey={player.coachKey} coachLabel={player.coachLabel} />
      <PlayerGradeTableCell gradeKey={player.gradeKey} gradeLabel={player.gradeLabel} />
      <PlayerAbiTableCell abiKey={player.abiKey} abiLabel={player.abiLabel} />
      <TableCell className="w-[5%] min-w-0 px-0.5 pt-2 text-center align-top">
        <PlayerRoiCell roi={player.roiTenDay} />
      </TableCell>
      <TableCell className="w-[5%] min-w-0 px-0.5 pt-2 text-center align-top">
        <PlayerFpTenDayCell value={player.fpTenDay} />
      </TableCell>
      <TableCell className="w-[5%] min-w-0 px-0.5 pt-2 text-center align-top">
        <PlayerFtTenDayCell value={player.ftTenDay} />
      </TableCell>
      <PlayerStatusTableCell status={player.status} />
      <PlayerTableRowActions player={player} canEditPlayers={canEditPlayers} onEdit={onEdit} />
    </TableRow>
  );
});

PlayerTableRow.displayName = "PlayerTableRow";

export default PlayerTableRow;