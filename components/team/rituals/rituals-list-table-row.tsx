"use client";

import { memo } from "react";
import { ArrowRight, MoreHorizontal, Pencil, Trash2, Undo2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";
import { RITUAL_AREA_COLORS } from "@/lib/constants/team/rituals";
import type { RitualDTO } from "@/lib/data/team/rituals-page";
import { governanceAreaTableChipCls } from "@/lib/constants/team/governance-ui";
import { GOVERNANCE_AREA_ICONS } from "@/components/team/governance/governance-area-icons";
import { ritualDescriptionForSearch } from "@/lib/utils/team/rituals-list-filters";

const RitualsListTableRow = memo(function RitualsListTableRow({
  ritual: r,
  onExecute,
  onEdit,
  onDelete,
  onUndo,
  undoPending,
}: {
  ritual: RitualDTO;
  onExecute: (r: RitualDTO) => void;
  onEdit: (r: RitualDTO) => void;
  onDelete: (r: RitualDTO) => void;
  onUndo: (r: RitualDTO) => void;
  undoPending: boolean;
}) {
  const data = new Date(r.startAt);
  const overdue = data < new Date() && r.executions.length === 0;
  const driName = r.dri?.displayName || r.responsibleName || "—";
  const hasExec = r.executions.length > 0;
  const desc = ritualDescriptionForSearch(r.description);
  const areaIcon = r.area ? (GOVERNANCE_AREA_ICONS[r.area] ?? null) : null;

  return (
    <TableRow className="text-sm">
      <TableCell
        className={cn(
          "min-w-0 max-w-0 py-3 pl-2 pr-2 text-left align-top",
          "whitespace-normal [overflow-wrap:anywhere] break-words",
        )}
      >
        <div className="min-w-0">
          <p className="font-semibold leading-snug text-foreground">{r.name}</p>
          {desc ? (
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="text-center align-middle">
        <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-medium">
          {r.ritualType || "—"}
        </Badge>
      </TableCell>
      <TableCell className="text-center align-middle">
        {r.area ? (
          areaIcon ? (
            <span className={governanceAreaTableChipCls(r.area)}>
              {areaIcon}
              <span className="truncate">{r.area}</span>
            </span>
          ) : (
            <Badge
              variant="outline"
              className={cn(
                "px-2.5 py-0.5 text-xs font-medium",
                RITUAL_AREA_COLORS[r.area] ?? "bg-muted text-muted-foreground",
              )}
            >
              {r.area}
            </Badge>
          )
        ) : (
          <span className="text-muted-foreground/70">—</span>
        )}
      </TableCell>
      <TableCell className="min-w-0 text-center text-xs font-medium leading-tight text-foreground whitespace-normal">
        <span className="line-clamp-2 break-words">{driName}</span>
      </TableCell>
      <TableCell className="text-center text-xs text-muted-foreground whitespace-normal">
        {r.recurrence || "—"}
      </TableCell>
      <TableCell className="whitespace-nowrap text-center tabular-nums text-xs text-muted-foreground">
        {format(data, "dd/MM/yyyy", { locale: ptBR })}
      </TableCell>
      <TableCell className="text-center tabular-nums text-xs text-muted-foreground">
        {r.durationMin ? `${r.durationMin} min` : "—"}
      </TableCell>
      <TableCell className="text-center align-middle">
        {hasExec ? (
          <Badge
            className={cn(
              "px-2.5 py-0.5 text-xs font-medium",
              "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15",
            )}
          >
            Concluído
          </Badge>
        ) : overdue ? (
          <Badge
            className={cn(
              "px-2.5 py-0.5 text-xs font-medium",
              "bg-rose-500/15 text-rose-700 hover:bg-rose-500/15",
            )}
          >
            Atrasado
          </Badge>
        ) : (
          <Badge
            className={cn(
              "px-2.5 py-0.5 text-xs font-medium",
              "bg-sky-500/15 text-sky-700 hover:bg-sky-500/15",
            )}
          >
            Agendado
          </Badge>
        )}
      </TableCell>
      <TableCell className="w-10 p-1 text-center align-middle">
        <div className="flex items-center justify-center">
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
            <DropdownMenuContent align="end" className="w-44">
              {hasExec ? (
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-amber-600 focus:text-amber-600"
                  disabled={undoPending}
                  onClick={() => onUndo(r)}
                >
                  <Undo2 className="h-3.5 w-3.5" /> Desfazer
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-primary focus:text-primary"
                  onClick={() => onExecute(r)}
                >
                  <ArrowRight className="h-3.5 w-3.5" /> Executar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => onEdit(r)}>
                <Pencil className="h-3.5 w-3.5" /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-rose-600 focus:text-rose-600"
                onClick={() => onDelete(r)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
});

RitualsListTableRow.displayName = "RitualsListTableRow";

export default RitualsListTableRow;
