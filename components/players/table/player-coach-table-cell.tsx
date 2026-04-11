import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { memo } from "react";

const PlayerCoachTableCell = memo(function PlayerCoachTableCell({
    coachKey,
    coachLabel,
  }: {
    coachKey: string;
    coachLabel: string;
  }) {
    return (
      <TableCell className="w-[9%] min-w-0 whitespace-normal align-middle">
        <Badge
          variant="outline"
          title={coachLabel}
          className="inline-flex h-6 max-w-full items-center border-primary/20 bg-primary/5 px-1.5 py-0 text-[11px] leading-none text-primary"
        >
          <span className="truncate">{coachKey !== "__none__" ? coachLabel : "Sem Coach"}</span>
        </Badge>
      </TableCell>
    );
  });

  PlayerCoachTableCell.displayName = "PlayerCoachTableCell";

  export default PlayerCoachTableCell;