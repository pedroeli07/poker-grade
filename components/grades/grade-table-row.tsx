import Link from "next/link";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GradeTableRowProps } from "@/lib/types";
import { playerTableBadgeClassName, playerTableBadgeEmptyClassName } from "@/lib/constants/classes";
import GradePlayersHover from "./grade-players-hover";
import { DeleteGradeButton } from "@/components/delete-grade-button";
import EditGradeModal from "@/components/modals/edit-grade-modal";
import { memo } from "react";

const GradeTableRow = memo(function GradeTableRow({
  grade,
  manage,
}: GradeTableRowProps) {
  return (
    <TableRow className="group border-border hover:bg-primary/3">
      <TableCell className="align-middle py-3 text-center">
        <div className="flex min-h-[1.5rem] w-full min-w-0 items-center justify-center">
          <Badge variant="outline" className={playerTableBadgeClassName}>
            {grade.name}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="align-middle py-3 text-center">
        <div className="flex min-h-[1.5rem] w-full min-w-0 items-center justify-center">
          {grade.description?.trim() ? (
            <Badge variant="outline" className={`${playerTableBadgeClassName} max-w-full min-w-0`}>
              <span className="line-clamp-2 break-words text-left">{grade.description}</span>
            </Badge>
          ) : (
            <Badge variant="outline" className={playerTableBadgeEmptyClassName}>
              —
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="align-middle py-3 text-center">
        <span className="tabular-nums font-medium text-foreground">
          {grade.rulesCount}
        </span>
      </TableCell>
      <TableCell className="align-middle py-3 text-center">
        <GradePlayersHover
          count={grade.assignmentsCount}
          players={grade.assignedPlayers}
          gradeName={grade.name}
          variant="table"
        />
      </TableCell>
      <TableCell className="text-right align-top py-3">
        <div className="inline-flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
            <Link href={`/dashboard/grades/${grade.id}`}>Ver regras</Link>
          </Button>
          {manage && (
            <>
              <EditGradeModal
                gradeId={grade.id}
                initialName={grade.name}
                initialDescription={grade.description}
                className="opacity-100"
              />
              <DeleteGradeButton
                gradeId={grade.id}
                gradeName={grade.name}
                className="opacity-100"
              />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

GradeTableRow.displayName = "GradeTableRow";

export default GradeTableRow;