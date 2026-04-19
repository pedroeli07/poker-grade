import Link from "next/link";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GradeTableRowProps } from "@/lib/types";
import {
  GRADE_DESCRIPTION_TOOLTIP_ARROW_CLASS,
  GRADE_DESCRIPTION_TOOLTIP_CONTENT_CLASS,
} from "@/lib/constants/grade";
import { playerTableBadgeClassName, playerTableBadgeEmptyClassName } from "@/lib/constants/classes";
import { DeleteGradeButton } from "@/components/grades/delete-grade-button";
import EditGradeModal from "@/components/modals/edit-grade-modal";
import { memo, useMemo } from "react";
import { htmlToPlainText } from "@/lib/utils";
import { Copy, Check, MoreHorizontal, FileText, Pencil, Trash2 } from "lucide-react";
import { AppTooltip } from "@/components/ui/app-tooltip";
import { useCopyFeedback } from "@/hooks/use-copy-feedback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const GradeDescriptionBadge = memo(function GradeDescriptionBadge({
  description,
}: {
  description: string;
}) {
  const plain = useMemo(() => htmlToPlainText(description), [description]);
  const { copied, copy } = useCopyFeedback({
    successTitle: "Descrição copiada!",
    getDescription: () => plain,
  });

  return (
    <AppTooltip
      className={GRADE_DESCRIPTION_TOOLTIP_CONTENT_CLASS}
      arrowClassName={GRADE_DESCRIPTION_TOOLTIP_ARROW_CLASS}
      content={
        <div
          className="flex flex-col gap-2 p-1.5 cursor-pointer w-full max-w-[min(550px,calc(100vw-2rem))]"
          onClick={(e) => copy(plain, e)}
        >
          <div className="flex items-center justify-between gap-4 border-b border-primary-foreground/20 pb-1.5">
            <span className="font-semibold text-primary-foreground text-[13px]">Descrição Completa</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-300" />
            ) : (
              <Copy className="cursor-pointer h-3.5 w-3.5 opacity-70 text-primary-foreground" />
            )}
          </div>
          <div className="text-[13px] whitespace-pre-wrap text-primary-foreground/95 break-words">
            {plain}
          </div>
          <p className="text-[11px] text-primary-foreground/80 mt-1 italic text-right">
            Clique para copiar
          </p>
        </div>
      }
    >
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => copy(plain, e)}
        onKeyDown={(e) => e.key === "Enter" && copy(plain, e)}
        className="flex items-center justify-center cursor-copy w-full min-w-0"
      >
        <Badge variant="outline" className={`${playerTableBadgeClassName} max-w-full min-w-0 group/badge`}>
          <span className="line-clamp-2 break-words text-left flex-1">{plain}</span>
          {copied ? (
            <Check className="ml-1.5 h-3 w-3 text-emerald-500 shrink-0" />
          ) : (
            <Copy className="ml-1.5 h-3 w-3 opacity-0 group-hover/badge:opacity-40 transition-opacity shrink-0" />
          )}
        </Badge>
      </div>
    </AppTooltip>
  );
});

GradeDescriptionBadge.displayName = "GradeDescriptionBadge";

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
            <GradeDescriptionBadge description={grade.description} />
          ) : (
            <Badge variant="outline" className={playerTableBadgeEmptyClassName}>
              —
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="align-middle py-3 text-center">
        <Link
          href={`/dashboard/grades/${grade.id}`}
          className="tabular-nums font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-label={`Abrir grade ${grade.name} — ${grade.rulesCount} regras`}
        >
          {grade.rulesCount}
        </Link>
      </TableCell>
      <TableCell className="text-center align-middle py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/grades/${grade.id}`} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Ver regras
              </Link>
            </DropdownMenuItem>
            {manage && (
              <>
                <EditGradeModal
                  gradeId={grade.id}
                  initialName={grade.name}
                  initialDescription={grade.description}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  }
                />
                <DeleteGradeButton
                  gradeId={grade.id}
                  gradeName={grade.name}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      variant="destructive"
                      className="cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  }
                />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

GradeTableRow.displayName = "GradeTableRow";

export default GradeTableRow;