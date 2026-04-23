"use client";

import { memo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowRightLeft,
  CheckSquare,
  Clock,
  Edit2,
  MoreHorizontal,
  Trash2,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TASK_ASSIGNEE_TEXT,
  TASK_CARD_STATUS_STYLE,
  TASK_STATUS_COLUMNS,
  EXECUTION_META_BADGE_SIZE,
  execTagStyle,
  priorityBadgeClass,
  priorityLabel,
} from "@/lib/constants/team/execution-ui";
import { cn } from "@/lib/utils/cn";
import type { ExecutionTaskCardProps } from "@/lib/types/team/execution";

export const ExecutionTaskCard = memo(function ExecutionTaskCard({
  task: t,
  onEdit,
  onDelete,
  onStatusChange,
  pending,
}: ExecutionTaskCardProps) {
  const overdue =
    t.dueAt && new Date(t.dueAt) < new Date() && t._status !== "DONE";
  const assigneeName = t.assignee?.displayName || t.responsibleName || "—";
  const statusStyle = TASK_CARD_STATUS_STYLE[t._status] ?? "";
  const assigneeColor = TASK_ASSIGNEE_TEXT[t._status] ?? "text-foreground";

  return (
    <TooltipProvider delayDuration={200}>
      <Card
        className={cn(
          "group rounded-xl border shadow-md transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-lg",
          statusStyle,
        )}
      >
        <CardContent className="flex flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-foreground">
              {t.title}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-mr-1 -mt-1 h-6 w-6 shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                  <Edit2 className="mr-2 h-3.5 w-3.5" /> Editar
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <ArrowRightLeft className="mr-2 h-3.5 w-3.5" /> Mover para
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {TASK_STATUS_COLUMNS.map((c) => (
                      <DropdownMenuItem
                        key={c.id}
                        disabled={pending || c.id === t._status}
                        onClick={() => onStatusChange(t.id, c.id)}
                        className="cursor-pointer"
                      >
                        {c.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {t.description ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {t.description}
            </p>
          ) : null}

          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {t._tagItems.slice(0, 3).map((tag, i) => {
                const s = execTagStyle(tag.colorName);
                return (
                  <Badge
                    key={`${t.id}-tag-${i}`}
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={EXECUTION_META_BADGE_SIZE}>
                      +{t._tagItems.length - 3}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-xs">
                    {t._tagItems
                      .slice(3)
                      .map((x) => x.label)
                      .join(", ")}
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
            <div className="shrink-0">
              <Badge variant="outline" className={priorityBadgeClass()}>
                {priorityLabel(t.priority)}
              </Badge>
            </div>
          </div>

          <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div
              className={cn(
                "flex min-w-0 items-center gap-1.5 font-medium",
                assigneeColor,
              )}
            >
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate" title={assigneeName}>
                {assigneeName}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {t.criteria[0] ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-0.5 text-emerald-600">
                      <CheckSquare className="h-3.5 w-3.5" />
                      {t.criteria.length}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px] text-xs">
                    {t.criteria[0]}
                  </TooltipContent>
                </Tooltip>
              ) : null}
              {t.dueAt ? (
                <span
                  className={cn(
                    "flex items-center gap-1 tabular-nums",
                    overdue && "font-semibold text-destructive",
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(t.dueAt), "dd/MM", { locale: ptBR })}
                </span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
});

ExecutionTaskCard.displayName = "ExecutionTaskCard";
