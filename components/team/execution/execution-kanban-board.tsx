"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { COLUMN_HEADER, COLUMN_WRAP } from "@/lib/constants/team/execution-ui";
import { cn } from "@/lib/utils/cn";
import type { ExecutionKanbanBoardProps } from "@/lib/types/team/execution";
import { ExecutionTaskCard } from "./execution-task-card";

export const ExecutionKanbanBoard = memo(function ExecutionKanbanBoard({
  statusColumns,
  tasksForColumn,
  onEditTask,
  onRequestDelete,
  onStatusChange,
  pending,
}: ExecutionKanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {statusColumns.map((col) => (
        <div
          key={col.id}
          className={cn("flex min-h-[420px] flex-col rounded-2xl border-2", COLUMN_WRAP[col.id])}
        >
          <div className="flex items-center justify-between border-b border-black/5 p-3">
            <h3 className="text-sm font-semibold">{col.label}</h3>
            <Badge variant="secondary" className={cn("rounded-md font-bold", COLUMN_HEADER[col.id])}>
              {tasksForColumn(col.id).length}
            </Badge>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-3">
            {tasksForColumn(col.id).map((task) => (
              <ExecutionTaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
                onDelete={() => onRequestDelete(task.id)}
                onStatusChange={onStatusChange}
                pending={pending}
              />
            ))}
            {tasksForColumn(col.id).length === 0 && (
              <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                Nenhuma tarefa
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

ExecutionKanbanBoard.displayName = "ExecutionKanbanBoard";
