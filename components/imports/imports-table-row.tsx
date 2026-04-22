import Link from "next/link";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AppTooltip } from "@/components/ui/app-tooltip";
import { FileSpreadsheet, ShieldCheck, AlertTriangle, ChevronRight, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { importRowDateLabel } from "@/lib/utils/notification";
import type { ImportsTableRowProps } from "@/lib/types/imports/index";
import { memo } from "react";

const ImportsTableRow = memo(function ImportsTableRow({
  item,
  canDelete,
  isSelected,
  isPending,
  onToggle,
  onDeleteRequest,
}: ImportsTableRowProps) {
  return (
    <TableRow
      className={cn(
        "group transition-colors bg-white",
        isSelected ? "bg-blue-100/50" : "hover:bg-blue-50"
      )}
    >
      {canDelete && (
        <TableCell
          className="pl-4 w-12"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <button
            type="button"
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer",
              isSelected
                ? "bg-primary border-primary"
                : "border-border hover:border-primary/60"
            )}
          >
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </button>
        </TableCell>
      )}
      <TableCell className="text-center font-medium">
        <AppTooltip content={<span className="max-w-sm break-all">{item.fileName}</span>}>
          <Link
            href={`/admin/grades/importacoes/${item.id}`}
            className="inline-flex max-w-full items-center justify-center gap-2 hover:text-primary transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate max-w-[280px] text-left">{item.fileName}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
          </Link>
        </AppTooltip>
      </TableCell>
      <TableCell className="text-center">
        {item.playerName || (
          <span className="text-muted-foreground italic text-sm">
            Não Identificado
          </span>
        )}
      </TableCell>
      <TableCell className="text-center font-bold tabular-nums">
        {item.totalRows}
      </TableCell>
      <TableCell className="text-center">
        <Badge
          variant="outline"
          className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
        >
          <ShieldCheck className="h-3 w-3 mr-1" />
          {item.matchedInGrade}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        {item.outOfGrade > 0 ? (
          <Badge
            variant="outline"
            className="border-red-500/30 text-red-600 bg-red-500/10"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {item.outOfGrade}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">0</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        {item.suspect > 0 ? (
          <Badge variant="outline" className="border-zinc-400/50 text-zinc-500 bg-zinc-100">
            {item.suspect}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">0</span>
        )}
      </TableCell>
      <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
        {importRowDateLabel(item)}
      </TableCell>
      {canDelete && (
        <TableCell className="w-12 pr-3">
          <button
            type="button"
            title="Excluir"
            onClick={onDeleteRequest}
            disabled={isPending}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-40 group-hover:opacity-100 cursor-pointer disabled:opacity-30"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </TableCell>
      )}
    </TableRow>
  );
});

ImportsTableRow.displayName = "ImportsTableRow";

export default ImportsTableRow;
