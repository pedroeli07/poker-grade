"use client";

import { memo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRightLeft, Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TASK_STATUS_COLUMNS,
  EXECUTION_META_BADGE_SIZE,
  execTagStyle,
  priorityBadgeClass,
  priorityLabel,
} from "@/lib/constants/team/execution-ui";
import { cn } from "@/lib/utils/cn";
import { executionAssigneeLabel } from "@/lib/utils/team/execution-list-filters";
import type { NormalizedExecutionTask } from "@/lib/types/team/execution";

const STATUS_BADGE: Record<string, string> = {
  TODO: "border-amber-200 bg-amber-50 text-amber-900",
  IN_PROGRESS: "border-indigo-200 bg-indigo-50 text-indigo-900",
  DONE: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

function statusLabel(id: string) {
  return TASK_STATUS_COLUMNS.find((c) => c.id === id)?.label ?? id;
}

const ExecutionTasksTableRow = memo(function ExecutionTasksTableRow({
  task: t,
  onEdit,
  onRequestDelete,
  onStatusChange,
  pending,
}: {
  task: NormalizedExecutionTask;
  onEdit: (task: NormalizedExecutionTask) => void;
  onRequestDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  pending: boolean;
}) {
  const overdue =
    t.dueAt && new Date(t.dueAt) < new Date() && t._status !== "DONE";
  const assignee = executionAssigneeLabel(t);

  return (
    <TableRow className="text-sm">
      <TableCell
        className={cn(
          "min-w-0 max-w-0 text-left align-top",
          "whitespace-normal [overflow-wrap:anywhere] break-words",
        )}
      >
        <div className="min-w-0">
          <p className="font-semibold leading-snug text-foreground">{t.title}</p>
          {t.description ? (
            <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {t.description}
            </p>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="text-center align-middle">
        <Badge variant="outline" className={priorityBadgeClass()}>
          {priorityLabel(t.priority)}
        </Badge>
      </TableCell>
      <TableCell className="text-center align-middle">
        <Badge
          variant="outline"
          className={cn(
            "px-2.5 py-0.5 text-xs font-medium",
            STATUS_BADGE[t._status] ?? "bg-muted text-muted-foreground",
          )}
        >
          {statusLabel(t._status)}
        </Badge>
      </TableCell>
      <TableCell className="min-w-0 text-center align-middle text-sm">
        <span className="line-clamp-2 break-words font-medium text-foreground">
          {assignee}
        </span>
      </TableCell>
      <TableCell
        className={cn(
          "whitespace-nowrap text-center align-middle tabular-nums text-sm",
          overdue ? "font-semibold text-destructive" : "text-muted-foreground",
        )}
      >
        {t.dueAt ? format(new Date(t.dueAt), "dd/MM/yyyy", { locale: ptBR }) : "—"}
      </TableCell>
      <TableCell className="min-w-0 text-center align-middle whitespace-normal">
        {t._tagItems.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {t._tagItems.slice(0, 3).map((tag, i) => {
              const s = execTagStyle(tag.colorName);
              return (
                <Badge
                  key={`${t.id}-row-tag-${i}`}
                  variant="outline"
                  className={cn(
                    EXECUTION_META_BADGE_SIZE,
                    s.bg,
                    s.text,
                    s.border,
                  )}
                >
                  {tag.label}
                </Badge>
              );
            })}
            {t._tagItems.length > 3 ? (
              <Badge
                variant="outline"
                className={cn(
                  EXECUTION_META_BADGE_SIZE,
                  "border-border/80 text-muted-foreground",
                )}
              >
                +{t._tagItems.length - 3}
              </Badge>
            ) : null}
          </div>
        ) : (
          <span className="text-muted-foreground/70">—</span>
        )}
      </TableCell>
      <TableCell className="w-[56px] text-right align-middle p-1">
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Ações da tarefa"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onEdit(t)}
              >
                <Edit2 className="mr-2 h-3.5 w-3.5" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <ArrowRightLeft className="mr-2 h-3.5 w-3.5" />
                  Mover para
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {TASK_STATUS_COLUMNS.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      className="cursor-pointer"
                      disabled={pending || c.id === t._status}
                      onClick={() => onStatusChange(t.id, c.id)}
                    >
                      {c.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => onRequestDelete(t.id)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
});

ExecutionTasksTableRow.displayName = "ExecutionTasksTableRow";

export default ExecutionTasksTableRow;
