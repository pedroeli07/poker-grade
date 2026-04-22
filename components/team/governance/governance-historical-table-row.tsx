"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statusLabel, decisionVisibilityLabel, DECISION_STATUS_OPTIONS } from "@/lib/constants/team/governance-mural-ui";
import { GOVERNANCE_STATUS_BADGE_CLASS, governanceAreaTableChipCls } from "@/lib/constants/team/governance-ui";
import { GOVERNANCE_AREA_ICONS } from "./governance-area-icons";
import { cn } from "@/lib/utils/cn";
import type { GovernanceDecisionDTO } from "@/lib/data/team/governance-page";
import { memo } from "react";

const GovernanceHistoricalTableRow = memo(function GovernanceHistoricalTableRow({
  decision: dec,
  onEdit,
  onRequestDelete,
}: {
  decision: GovernanceDecisionDTO;
  onEdit: (d: GovernanceDecisionDTO) => void;
  onRequestDelete: (id: string) => void;
}) {
  const areaIcon = GOVERNANCE_AREA_ICONS[dec.area] ?? null;
  return (
    <TableRow className="text-sm">
      <TableCell
        className={cn(
          "min-w-0 max-w-0 text-left align-top",
          "whitespace-normal [overflow-wrap:anywhere] break-words",
        )}
      >
        <div className="min-w-0">
          <p className="font-semibold leading-snug text-foreground">{dec.title}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {dec.summary}
          </p>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {areaIcon ? (
          <span className={governanceAreaTableChipCls(dec.area)}>
            {areaIcon}
            <span className="truncate">{dec.area}</span>
          </span>
        ) : (
          <span className="text-xs font-medium leading-tight text-muted-foreground">{dec.area}</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-center tabular-nums text-muted-foreground text-xs">
        {format(new Date(dec.decidedAt), "dd/MM/yyyy", { locale: ptBR })}
      </TableCell>
      <TableCell className="text-center">
        <Badge
          className={cn(
            "px-2.5 py-0.5 text-xs font-medium",
            GOVERNANCE_STATUS_BADGE_CLASS[dec.status] ?? "bg-amber-50 text-amber-800",
          )}
        >
          {statusLabel(dec.status, DECISION_STATUS_OPTIONS)}
        </Badge>
      </TableCell>
      <TableCell className="whitespace-normal text-center text-xs text-muted-foreground">
        {decisionVisibilityLabel(dec.visibility)}
      </TableCell>
      <TableCell className="min-w-0 text-center text-xs whitespace-normal">
        <span className="line-clamp-2 break-words font-medium text-foreground">
          {dec.author?.displayName || dec.author?.email || "—"}
        </span>
      </TableCell>
      <TableCell className="min-w-0 text-center whitespace-normal">
        {dec.tags.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-0.5">
            {dec.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="secondary" className="px-2 py-0.5 text-xs font-medium">
                {t}
              </Badge>
            ))}
            {dec.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{dec.tags.length - 3}</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground/70">—</span>
        )}
      </TableCell>
      <TableCell className="w-[40px] text-right p-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              aria-label="Ações"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2" onClick={() => onEdit(dec)}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={() => onRequestDelete(dec.id)}
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

GovernanceHistoricalTableRow.displayName = "GovernanceHistoricalTableRow";

export default GovernanceHistoricalTableRow;
