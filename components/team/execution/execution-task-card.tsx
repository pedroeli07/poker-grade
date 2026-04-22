"use client";

import { memo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle2,
  CheckSquare,
  Clock,
  Edit2,
  MoreVertical,
  Trash2,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TASK_STATUS_COLUMNS,
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
  return (
    <Card className="group border transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="space-y-3 p-3">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="outline" className={priorityBadgeClass(t.priority)}>
              {priorityLabel(t.priority)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 opacity-70 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                  <Edit2 className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm font-semibold leading-snug text-foreground">{t.title}</p>
          {t.description ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
          ) : null}
          {t.criteria[0] ? (
            <div className="flex items-start gap-2 rounded-md border border-emerald-100 bg-emerald-50/60 p-2 text-[11px] text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>{t.criteria[0]}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            {t.assignee?.displayName || t.responsibleName || "—"}
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {t.dueAt && (
                <span
                  className={cn(
                    "flex items-center gap-1",
                    new Date(t.dueAt) < new Date() && t._status !== "DONE" && "text-destructive",
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(t.dueAt), "dd/MM", { locale: ptBR })}
                </span>
              )}
              {t.criteria.length > 0 && (
                <span className="flex items-center gap-0.5">
                  <CheckSquare className="h-3.5 w-3.5" />
                  {t.criteria.length}
                </span>
              )}
            </div>
            <div className="w-6 text-center text-[9px] font-bold text-indigo-700">
              {(t.assignee?.displayName || t.responsibleName || "UN").slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="pt-1">
            <Label className="text-[10px] uppercase text-muted-foreground">Mover</Label>
            <Select
              value={t._status}
              onValueChange={(v) => onStatusChange(t.id, v)}
              disabled={pending}
            >
              <SelectTrigger className="mt-0.5 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUS_COLUMNS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ExecutionTaskCard.displayName = "ExecutionTaskCard";
