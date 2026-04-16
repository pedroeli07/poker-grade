import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import {
  playerTableCoachGradeBadgeClassName,
  playerTableCoachGradeBadgeEmptyClassName,
} from "@/lib/constants/classes";
import { playersTableCol } from "@/lib/constants/classes";
import { cn } from "@/lib/utils";
import { memo } from "react";

import type { PlayerCoachTableCellProps } from "@/lib/types/player";

const PlayerCoachTableCell = memo(function PlayerCoachTableCell({
  coachKey,
  coachLabel,
}: PlayerCoachTableCellProps) {
  const empty = coachKey === "__none__";
  return (
    <TableCell className={cn(playersTableCol.coach, "whitespace-normal text-center align-middle")}>
      <div className="flex justify-center">
        <Badge
          variant="outline"
          title={coachLabel}
          className={empty ? playerTableCoachGradeBadgeEmptyClassName : playerTableCoachGradeBadgeClassName}
        >
          <span className="truncate">{coachKey !== "__none__" ? coachLabel : "Sem Coach"}</span>
        </Badge>
      </div>
    </TableCell>
  );
});

PlayerCoachTableCell.displayName = "PlayerCoachTableCell";

export default PlayerCoachTableCell;