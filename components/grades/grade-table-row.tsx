import Link from "next/link";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GradeTableRowProps } from "@/lib/types";
import GradePlayersHover from "./grade-players-hover";
import { DeleteGradeButton } from "@/components/delete-grade-button";
import { EditGradeDialog } from "@/components/edit-grade-dialog";
import { memo } from "react";

const GradeTableRow = memo(function GradeTableRow({
  grade,
  manage,
}: GradeTableRowProps) {
  return (
    <TableRow className="group border-border hover:bg-primary/3">
      <TableCell className="font-medium text-foreground align-top py-3">
        {grade.name}
      </TableCell>
      <TableCell className="align-top py-3">
        {grade.description?.trim() ? (
          <span className="text-sm text-foreground/90 line-clamp-2 max-w-xl">
            {grade.description}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell className="align-top py-3">
        <span className="tabular-nums font-medium text-foreground">
          {grade.rulesCount}
        </span>
      </TableCell>
      <TableCell className="align-top py-3">
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
              <EditGradeDialog
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