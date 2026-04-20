import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TargetListRow as TargetListRowType, TargetListViewModel } from "@/lib/types";
import { splitCategoryLabelForDisplay } from "@/lib/utils/target";
import { memo } from "react";
import TargetTableRowActions from "@/components/targets/target-table-row-actions";
import { Check, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

const TargetTableRow = memo(function TargetTableRow({
  vm,
  row,
  canWrite,
  hidePlayerColumn = false,
  bulkSelect,
}: {
  vm: TargetListViewModel;
  row: TargetListRowType;
  canWrite: boolean;
  /** Visão jogador: só um jogador — sem coluna Jogador. */
  hidePlayerColumn?: boolean;
  bulkSelect?: {
    isSelected: boolean;
    isPending: boolean;
    onToggle: () => void;
  } | null;
}) {
  const categoryParts = splitCategoryLabelForDisplay(vm.categoryLabel);

  return (
    <TableRow
      className={cn(
        "transition-colors",
        bulkSelect?.isSelected ? "bg-blue-100/50 hover:bg-blue-100/60" : "hover:bg-muted/30"
      )}
    >
      {bulkSelect ? (
        <TableCell
          className="w-12 pl-4"
          onClick={(e) => {
            e.stopPropagation();
            bulkSelect.onToggle();
          }}
        >
          <button
            type="button"
            disabled={bulkSelect.isPending}
            className={cn(
              "flex h-5 w-5 cursor-pointer items-center justify-center rounded border transition-colors",
              bulkSelect.isSelected
                ? "border-primary bg-primary"
                : "border-border hover:border-primary/60",
              bulkSelect.isPending && "cursor-not-allowed opacity-50"
            )}
            aria-label={bulkSelect.isSelected ? "Desmarcar linha" : "Selecionar linha"}
          >
            {bulkSelect.isSelected && <Check className="h-3 w-3 text-white" />}
          </button>
        </TableCell>
      ) : null}

      {!hidePlayerColumn ? (
        <TableCell className="align-middle py-4 text-center">
          <Link
            href={`/admin/jogadores/${vm.playerId}`}
            className="inline-block hover:text-primary font-medium transition-colors"
          >
            {vm.playerName}
          </Link>
        </TableCell>
      ) : null}

      {/* Meta */}
      <TableCell className="font-medium align-middle py-4 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className="block leading-tight">{vm.name}</span>
          {vm.hasLimitAction && (
            <span className={`text-[11px] text-center mt-0.5 ${vm.limitActionColor}`}>
              Gatilho: {vm.limitActionLabel}
            </span>
          )}
        </div>
      </TableCell>

      {/* Categoria */}
      <TableCell className="align-middle py-4 text-center">
        <Badge
          variant="outline"
          className="flex h-auto min-h-8 max-w-[min(280px,100%)] flex-col items-center justify-center gap-0.5 rounded-lg border-border/50 px-3 py-1.5 text-center text-sm font-medium leading-snug whitespace-normal"
        >
          <span className="block leading-tight">{categoryParts.title}</span>
          {categoryParts.parenthetical != null ? (
            <span className="block leading-tight">{categoryParts.parenthetical}</span>
          ) : null}
        </Badge>
      </TableCell>

      {/* Progresso */}
      <TableCell className="align-middle py-4 text-center">
        {vm.isNumeric ? (
          <div className="mx-auto flex w-full max-w-[200px] flex-col items-center gap-1.5">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              {vm.showTableProgressBar && (
                <div
                  className={`h-full rounded-full ${vm.progressColor}`}
                  style={{ width: `${vm.progressPercent}%` }}
                />
              )}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs tabular-nums">
              <span className="font-bold text-foreground">{vm.progressCurrent}</span>
              <span className="text-muted-foreground">
                / {vm.progressTotal}
                {vm.progressUnit && <span className="ml-0.5">{vm.progressUnit}</span>}
              </span>
            </div>
          </div>
        ) : (
          <span className="inline-block text-sm text-muted-foreground tabular-nums">
            {vm.textCurrent ?? "—"} / {vm.textValue ?? "—"}
          </span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell className="align-middle py-4 text-center">
        <div className="flex justify-center">
          <div
            className={`inline-flex items-center justify-center gap-1.5 border ${vm.statusConfig.bg} px-2.5 py-1 rounded-lg shrink-0`}
          >
            <vm.statusConfig.icon className="h-4 w-4" />
            <span className="text-xs font-semibold">{vm.statusConfig.label}</span>
          </div>
        </div>
      </TableCell>

      {/* Gatilho */}
      <TableCell className="align-middle py-4 text-center">
        {vm.hasLimitAction ? (
          <span className={`text-xs font-medium ${vm.limitActionColor}`}>
            {vm.limitActionLabel}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/60">—</span>
        )}
      </TableCell>

      {/* Nota do coach */}
      <TableCell className="align-middle py-4 text-center">
        {vm.coachNotes ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground max-w-[180px] truncate cursor-help">
                <StickyNote className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                <span className="truncate">{vm.coachNotesPreview}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="max-w-sm whitespace-pre-wrap">
              {vm.coachNotes}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </TableCell>

      {/* Atualizado */}
      <TableCell className="align-middle py-4 text-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <time
              dateTime={vm.updatedAtIso}
              className="text-xs text-muted-foreground tabular-nums"
            >
              {vm.updatedAtLabel}
            </time>
          </TooltipTrigger>
          <TooltipContent side="top">{new Date(vm.updatedAtIso).toLocaleString("pt-BR")}</TooltipContent>
        </Tooltip>
      </TableCell>

      {/* Ações */}
      <TableCell className="align-middle py-4 text-center">
        {canWrite ? <TargetTableRowActions target={row} /> : null}
      </TableCell>
    </TableRow>
  );
});

TargetTableRow.displayName = "TargetTableRow";

export default TargetTableRow;
