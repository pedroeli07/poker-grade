"use client";

import { memo, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import DataTableShell from "@/components/data-table/data-table-shell";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import {
  dataTableHeaderRowActiveRingClass,
  dataTableHeaderRowClass,
} from "@/lib/constants/classes";
import {
  buildExecutionFilterSummaryLines,
  formatExecutionTableSortSummary,
} from "@/lib/utils/team/execution-list-filters";
import type { SortDir } from "@/lib/table-sort";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import type { NormalizedExecutionTask } from "@/lib/types/team/execution";
import type {
  ExecutionTaskColumnFilters,
  ExecutionTaskColumnOptions,
  ExecutionTaskSortKey,
  ExecutionTasksSetCol,
} from "@/lib/types/team/execution-list";
import type { ExecutionView } from "@/hooks/team/use-execution-list";
import { ExecutionTaskCard } from "./execution-task-card";
import { ExecutionKanbanBoard } from "./execution-kanban-board";
import ExecutionTasksTableHeadFilters from "./execution-tasks-table-head-filters";
import ExecutionTasksTableRow from "./execution-tasks-table-row";
import type { TaskStatusId } from "@/lib/constants/team/execution-ui";

const TasksEmptyState = memo(function TasksEmptyState({
  hasActiveView,
  onClear,
  compact,
}: {
  hasActiveView: boolean;
  onClear: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="text-muted-foreground text-sm">
        Nenhuma tarefa com a seleção atual.{" "}
        {hasActiveView && (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-primary"
            onClick={onClear}
          >
            Limpar
          </Button>
        )}
      </div>
    );
  }
  return (
    <Card className="border-dashed bg-muted/15 py-16 text-center">
      <p className="text-foreground/85 font-medium">
        Nenhuma tarefa com a seleção atual.
      </p>
      <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
        Ajuste a busca, os filtros de coluna ou a ordenação, ou crie uma nova tarefa.
      </p>
      {hasActiveView && (
        <div className="mt-4">
          <Button type="button" variant="link" className="text-primary" onClick={onClear}>
            Limpar busca, filtros e ordenação
          </Button>
        </div>
      )}
    </Card>
  );
});
TasksEmptyState.displayName = "TasksEmptyState";

const ExecutionTasksBody = memo(function ExecutionTasksBody({
  view,
  options,
  filters,
  setCol,
  anyFilter,
  clearTableView,
  tableRows,
  kanbanRows,
  matchedCount,
  hasActiveView,
  sort,
  onSort,
  statusColumns,
  onEditTask,
  onRequestDelete,
  onStatusChange,
  pending,
}: {
  view: ExecutionView;
  options: ExecutionTaskColumnOptions;
  filters: ExecutionTaskColumnFilters;
  setCol: ExecutionTasksSetCol;
  anyFilter: boolean;
  clearTableView: () => void;
  tableRows: NormalizedExecutionTask[];
  kanbanRows: NormalizedExecutionTask[];
  matchedCount: number;
  hasActiveView: boolean;
  sort: { key: ExecutionTaskSortKey; dir: SortDir } | null;
  onSort: (k: ExecutionTaskSortKey, kind: ColumnSortKind) => void;
  statusColumns: readonly { id: TaskStatusId; label: string }[];
  onEditTask: (task: NormalizedExecutionTask) => void;
  onRequestDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  pending: boolean;
}) {
  const filterSummaryLines = useMemo(
    () => buildExecutionFilterSummaryLines(options, filters),
    [options, filters],
  );
  const sortSummary = useMemo(
    () => formatExecutionTableSortSummary(sort),
    [sort],
  );

  if (view === "kanban") {
    if (matchedCount === 0) {
      return (
        <TasksEmptyState hasActiveView={hasActiveView} onClear={clearTableView} />
      );
    }
    const tasksForColumn = (status: TaskStatusId) =>
      kanbanRows.filter((t) => t._status === status);
    return (
      <ExecutionKanbanBoard
        statusColumns={statusColumns}
        tasksForColumn={tasksForColumn}
        onEditTask={onEditTask}
        onRequestDelete={onRequestDelete}
        onStatusChange={onStatusChange}
        pending={pending}
      />
    );
  }

  if (view === "cards") {
    if (matchedCount === 0) {
      return (
        <TasksEmptyState hasActiveView={hasActiveView} onClear={clearTableView} />
      );
    }
    return (
      <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tableRows.map((task) => (
          <ExecutionTaskCard
            key={task.id}
            task={task}
            onEdit={() => onEditTask(task)}
            onDelete={() => onRequestDelete(task.id)}
            onStatusChange={onStatusChange}
            pending={pending}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DataTableToolbar
        filteredCount={tableRows.length}
        totalCount={matchedCount}
        entityLabels={["tarefa", "tarefas"]}
        hasActiveView={hasActiveView}
        anyFilter={anyFilter}
        sortSummary={sortSummary}
        filterSummaryLines={filterSummaryLines}
        onClear={clearTableView}
        filterChipsSectionTitle="Filtros e busca ativos"
        hideShowingCount
      />
      <DataTableShell hasActiveView={hasActiveView}>
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <Table className="min-w-[1100px] w-full table-fixed">
            <TableHeader>
              <TableRow
                className={cn(
                  "border-b border-border",
                  cardClassName,
                  dataTableHeaderRowClass,
                  hasActiveView && dataTableHeaderRowActiveRingClass,
                )}
              >
                <ExecutionTasksTableHeadFilters
                  options={options}
                  filters={filters}
                  setCol={setCol}
                  sort={sort}
                  onSort={onSort}
                />
                <TableHead className="w-[72px] p-0 text-center align-middle" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchedCount === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center">
                    <TasksEmptyState
                      hasActiveView={hasActiveView}
                      onClear={clearTableView}
                      compact
                    />
                  </TableCell>
                </TableRow>
              ) : (
                tableRows.map((task) => (
                  <ExecutionTasksTableRow
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onRequestDelete={onRequestDelete}
                    onStatusChange={onStatusChange}
                    pending={pending}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DataTableShell>
    </div>
  );
});

ExecutionTasksBody.displayName = "ExecutionTasksBody";

export default ExecutionTasksBody;
