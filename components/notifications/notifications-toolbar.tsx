import { Check, Trash2, LayoutGrid, Table2 } from "lucide-react";
import PaginationToolbarControls from "@/components/data-table/pagination-toolbar-controls";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationsFilterTab } from "@/components/notifications/notifications-empty-state";
import { memo } from "react";
import ColumnFilter from "@/components/column-filter";
import { TYPE_LABELS } from "@/lib/constants/notification";
import { NotificationType } from "@prisma/client";

const typeOptions = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));

const NotificationsToolbar = memo(function NotificationsToolbar({
  allSelected,
  onToggleAll,
  filter,
  onChangeFilter,
  typeFilters,
  onChangeTypeFilters,
  unreadCount,
  selectedSize,
  onDeleteSelected,
  pageSize,
  onChangePageSize,
  viewMode,
  onChangeViewMode,
  page,
  totalPages,
  total,
  onChangePage,
  showTypeFilterInToolbar,
}: {
  allSelected: boolean;
  onToggleAll: () => void;
  filter: NotificationsFilterTab;
  onChangeFilter: (f: NotificationsFilterTab) => void;
  typeFilters: Set<NotificationType>;
  onChangeTypeFilters: (next: Set<NotificationType> | null) => void;
  unreadCount: number;
  selectedSize: number;
  onDeleteSelected: () => void;
  pageSize: number;
  onChangePageSize: (size: number) => void;
  viewMode: "cards" | "table";
  onChangeViewMode: (mode: "cards" | "table") => void;
  page: number;
  totalPages: number;
  total: number;
  onChangePage: (p: number) => void;
  /** No modo tabela o filtro de tipo fica na coluna; oculta o ColumnFilter daqui. */
  showTypeFilterInToolbar: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-border">
      {/* Esquerda */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleAll}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer",
              allSelected ? "bg-primary border-primary" : "border-border hover:border-primary/60"
            )}
          >
            {allSelected && <Check className="h-3 w-3 text-white" />}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onChangeFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                filter === f
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              )}
            >
              {f === "all" ? "Todas" : f === "unread" ? "Não lidas" : "Lidas"}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {showTypeFilterInToolbar && (
          <>
            <div className="h-4 w-px bg-border hidden sm:block"></div>
            <ColumnFilter
              columnId="type"
              label="Tipo"
              options={typeOptions}
              applied={typeFilters.size > 0 ? typeFilters : null}
              onApply={(next) =>
                onChangeTypeFilters(
                  next === null ? null : (new Set(next) as Set<NotificationType>),
                )
              }
              compact={true}
            />
          </>
        )}
      </div>

      {/* Direita */}
      <div className="flex items-center gap-4 ml-auto">
        {selectedSize > 0 && (
          <button
            type="button"
            onClick={onDeleteSelected}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-semibold hover:bg-destructive/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Excluir ({selectedSize})
          </button>
        )}

        <div className="inline-flex shrink-0 rounded-lg border border-border bg-muted/30 p-0.5">
          <Button
            type="button"
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="sm"
            className={cn("h-8 gap-2 text-xs", viewMode === "cards" && "bg-primary/12 text-primary")}
            onClick={() => onChangeViewMode("cards")}
            title="Visualização em cards"
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Cards
          </Button>
          <Button
            type="button"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className={cn("h-8 gap-2 text-xs", viewMode === "table" && "bg-primary/12 text-primary")}
            onClick={() => onChangeViewMode("table")}
            title="Visualização em tabela"
          >
            <Table2 className="h-3.5 w-3.5" /> Tabela
          </Button>
        </div>
        <PaginationToolbarControls
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
        />
      </div>
    </div>
  );
});

NotificationsToolbar.displayName = "NotificationsToolbar";

export default NotificationsToolbar;