import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { memo } from "react"

const PlayerGradeTableCell = memo(function PlayerGradeTableCell({
    gradeKey,
    gradeLabel,
  }: {
    gradeKey: string;
    gradeLabel: string;
  }) {
    return (
      <TableCell className="w-[9%] min-w-0 whitespace-normal align-middle pr-2">
        <Badge
          variant="outline"
          title={gradeLabel}
          className="inline-flex h-6 max-w-full items-center border-primary/20 bg-primary/5 px-1.5 py-0 text-[11px] leading-none text-primary"
        >
          <span className="truncate">{gradeKey !== "__none__" ? gradeLabel : "Não atribuída"}</span>
        </Badge>
      </TableCell>
    );
  });

  PlayerGradeTableCell.displayName = "PlayerGradeTableCell";

  export default PlayerGradeTableCell;