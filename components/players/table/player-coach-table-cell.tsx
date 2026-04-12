import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { memo } from "react";
import { badgeClassName } from "./player-grade-table-cell";

const PlayerCoachTableCell = memo(function PlayerCoachTableCell({
  coachKey,
  coachLabel,
}: {
  coachKey: string;
  coachLabel: string;
}) {
  return (
    <TableCell className="w-[8%] min-w-0 whitespace-normal text-center align-middle">
      <div className="flex justify-center">
        <Badge
          variant="outline"
          title={coachLabel}
          className={badgeClassName}
        >
          <span className="truncate">{coachKey !== "__none__" ? coachLabel : "Sem Coach"}</span>
        </Badge>
      </div>
    </TableCell>
  );
});

PlayerCoachTableCell.displayName = "PlayerCoachTableCell";

export default PlayerCoachTableCell;