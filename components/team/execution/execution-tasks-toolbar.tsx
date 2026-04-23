"use client";

import { memo } from "react";
import { KanbanSquare, LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import PaginationToolbarControls from "@/components/data-table/pagination-toolbar-controls";
import ExecutionTasksColFilters from "./execution-tasks-col-filters";
import type {
  ExecutionTaskColumnFilters,
  ExecutionTaskColumnOptions,
  ExecutionTasksSetCol,
} from "@/lib/types/team/execution-list";
import type { ExecutionView } from "@/hooks/team/use-execution-list";

const VIEW_ORDER: { id: ExecutionView; label: string; Icon: typeof LayoutGrid }[] = [
  { id: "kanban", label: "Quadro", Icon: KanbanSquare },
  { id: "cards", label: "Cards", Icon: LayoutGrid },
  { id: "table", label: "Tabela", Icon: Table2 },
];

const ExecutionTasksToolbar = memo(function ExecutionTasksToolbar({
  view,
  setView,
  options,
  filters,
  setCol,
  matchedCount,
  totalCount,
  anyFilter,
  clearFilters,
  page,
  pageSize,
  totalPages,
  onChangePage,
  onChangePageSize,
  pageItemCount,
}: {
  view: ExecutionView;
  setView: (v: ExecutionView) => void;
  options: ExecutionTaskColumnOptions;
  filters: ExecutionTaskColumnFilters;
  setCol: ExecutionTasksSetCol;
  matchedCount: number;
  totalCount: number;
  pageItemCount: number;
  anyFilter: boolean;
  clearFilters: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onChangePage: (p: number) => void;
  onChangePageSize: (size: number) => void;
}) {
  const showFilters = view !== "table";

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        view === "cards" || view === "kanban"
          ? "flex-col lg:flex-row lg:items-center"
          : "flex-col sm:flex-row sm:items-center sm:justify-between",
      )}
    >
      <div
        className={cn(
          "inline-flex shrink-0 rounded-lg border border-border p-0.5 bg-muted/30",
          (view === "cards" || view === "kanban") && "mx-auto lg:mx-0",
        )}
        role="group"
        aria-label="Modo de visualização"
      >
        {VIEW_ORDER.map(({ id, label, Icon }) => (
          <Button
            key={id}
            type="button"
            variant={view === id ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "gap-2 h-8 text-xs",
              view === id && "bg-primary/12 text-primary shadow-none",
            )}
            onClick={() => setView(id)}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>

      {showFilters && (
        <div className="flex min-w-0 flex-1 justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <ExecutionTasksColFilters
              compact
              options={options}
              filters={filters}
              setCol={setCol}
            />
          </div>
        </div>
      )}

      {(view === "cards" || view === "kanban") && (
        <div
          className={cn(
            "flex w-full min-w-0 flex-col items-center gap-3 text-sm text-muted-foreground",
            "lg:ml-auto lg:max-w-none lg:flex-1 lg:flex-row lg:justify-end lg:gap-4",
          )}
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>
              <span className="font-medium text-foreground">{matchedCount}</span>
              {" / "}
              <span className="font-medium text-foreground">{totalCount}</span>
              {" tarefas"}
            </span>
            {anyFilter && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-primary"
                onClick={clearFilters}
              >
                Limpar
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 lg:shrink-0">
            <PaginationToolbarControls
              page={page}
              pageSize={pageSize}
              total={matchedCount}
              totalPages={totalPages}
              onChangePage={onChangePage}
              onChangePageSize={onChangePageSize}
            />
          </div>
        </div>
      )}

      {view === "table" && (
        <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          <div className="flex flex-wrap items-center justify-end gap-3 sm:shrink-0">
            <PaginationToolbarControls
              countSummary={
                <span className="text-sm text-muted-foreground sm:text-right">
                  Mostrando{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {pageItemCount}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {matchedCount}
                  </span>{" "}
                  {matchedCount === 1 ? "tarefa" : "tarefas"}
                </span>
              }
              page={page}
              pageSize={pageSize}
              total={matchedCount}
              totalPages={totalPages}
              onChangePage={onChangePage}
              onChangePageSize={onChangePageSize}
            />
          </div>
        </div>
      )}
    </div>
  );
});

ExecutionTasksToolbar.displayName = "ExecutionTasksToolbar";

export default ExecutionTasksToolbar;
