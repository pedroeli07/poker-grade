"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatIndicatorMeta,
  indicatorFrequencyLabel,
  indicatorResultTypeBadgeCls,
  INDICATOR_RESULT_TYPE_LABEL,
} from "@/lib/constants/team/indicators-catalog-ui";
import { cn } from "@/lib/utils/cn";
import type { TeamIndicatorDTO } from "@/lib/data/team/indicators-page";
import { memo } from "react";

const cellWrap = cn(
  "min-w-0 max-w-0 align-top text-left",
  "whitespace-normal [overflow-wrap:anywhere] break-words",
);

function linkLikeButtonCls() {
  return cn(
    "inline p-0 h-auto text-left font-medium text-primary hover:underline",
    "bg-transparent shadow-none border-0 rounded-none cursor-pointer",
  );
}

const IndicatorsCatalogTableRow = memo(function IndicatorsCatalogTableRow({
  row,
  onEdit,
  onRequestDelete,
}: {
  row: TeamIndicatorDTO;
  onEdit: (r: TeamIndicatorDTO) => void;
  onRequestDelete: (id: string) => void;
}) {
  return (
    <TableRow className="text-sm">
      <TableCell className={cellWrap}>
        <button type="button" className={linkLikeButtonCls()} onClick={() => onEdit(row)}>
          {row.name}
        </button>
      </TableCell>
      <TableCell className="align-top text-center">
        <span className={indicatorResultTypeBadgeCls(row.resultType)}>
          {INDICATOR_RESULT_TYPE_LABEL[row.resultType] ?? row.resultType}
        </span>
      </TableCell>
      <TableCell className={cn(cellWrap, "text-muted-foreground")}>
        {row.definition?.trim() ? row.definition : "—"}
      </TableCell>
      <TableCell className={cellWrap}>
        <button type="button" className={linkLikeButtonCls()} onClick={() => onEdit(row)}>
          {row.dataSource}
        </button>
      </TableCell>
      <TableCell className={cn(cellWrap, "text-center text-xs font-medium text-foreground")}>
        {row.responsibleName?.trim() ? row.responsibleName : "—"}
      </TableCell>
      <TableCell className={cn(cellWrap, "text-center font-medium tabular-nums")}>
        {formatIndicatorMeta(row.targetValue, row.unit)}
      </TableCell>
      <TableCell className={cn(cellWrap, "text-center text-primary font-medium")}>
        {indicatorFrequencyLabel(row.frequency)}
      </TableCell>
      <TableCell className={cn(cellWrap, "text-muted-foreground")}>{row.autoAction}</TableCell>
      <TableCell className={cn(cellWrap, "text-muted-foreground")}>
        {row.glossary?.trim() ? row.glossary : "—"}
      </TableCell>
      <TableCell className="align-top text-center text-sm">
        {row.sourceUrl?.trim() ? (
          <a
            href={row.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline break-all"
          >
            Abrir
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="w-10 p-1 text-right align-top">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              aria-label={`Ações: ${row.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2" onClick={() => onEdit(row)}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={() => onRequestDelete(row.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

IndicatorsCatalogTableRow.displayName = "IndicatorsCatalogTableRow";

export default IndicatorsCatalogTableRow;
