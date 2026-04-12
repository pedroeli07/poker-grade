import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { memo } from "react"

export const badgeClassName = "inline-flex h-8 max-w-full items-center border-primary/20 bg-primary/5 px-1.5 py-0 text-[11px] shadow-blue-500/50 hover:bg-blue-500/20 hover:shadow-blue-500 shadow-lg hover:shadow-lg leading-none text-primary"

const PlayerGradeTableCell = memo(function PlayerGradeTableCell({
  gradeKey,
  gradeLabel,
}: {
  gradeKey: string;
  gradeLabel: string;
}) {
  return (
    <TableCell className="w-[9%] min-w-0 whitespace-normal text-center align-middle">
      <div className="flex justify-center">
        <Badge
          variant="outline"
          title={gradeLabel}
          className={badgeClassName}
        >
          <span className="truncate">{gradeKey !== "__none__" ? gradeLabel : "Não atribuída"}</span>
        </Badge>
      </div>
    </TableCell>
  );
});

PlayerGradeTableCell.displayName = "PlayerGradeTableCell";

export default PlayerGradeTableCell;