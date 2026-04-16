import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import {
  playerTableCoachGradeBadgeClassName,
  playerTableCoachGradeBadgeEmptyClassName,
} from "@/lib/constants/classes";
import { playersTableCol } from "@/lib/constants/classes";
import { cn } from "@/lib/utils";
import { memo } from "react";

import type { PlayerGradeTableCellProps } from "@/lib/types/player";

const PlayerGradeTableCell = memo(function PlayerGradeTableCell({
  gradeKey,
  gradeLabel,
}: PlayerGradeTableCellProps) {
  const empty = gradeKey === "__none__";
  return (
    <TableCell className={cn(playersTableCol.grade, "whitespace-normal text-center align-middle")}>
      <div className="flex justify-center">
        <Badge
          variant="outline"
          title={gradeLabel}
          className={empty ? playerTableCoachGradeBadgeEmptyClassName : playerTableCoachGradeBadgeClassName}
        >
          <span className="truncate">{gradeKey !== "__none__" ? gradeLabel : "Não atribuída"}</span>
        </Badge>
      </div>
    </TableCell>
  );
});

PlayerGradeTableCell.displayName = "PlayerGradeTableCell";

export default PlayerGradeTableCell;