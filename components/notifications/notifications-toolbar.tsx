import { Check, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationsFilterTab } from "@/components/notifications/notifications-empty-state";
import { memo } from "react";

const NotificationsToolbar = memo(function NotificationsToolbar({
  allSelected,
  onToggleAll,
  filter,
  onChangeFilter,
  unreadCount,
  selectedSize,
  onDeleteSelected,
  page,
  totalPages,
  total,
  onChangePage,
}: {
  allSelected: boolean;
  onToggleAll: () => void;
  filter: NotificationsFilterTab;
  onChangeFilter: (f: NotificationsFilterTab) => void;
  unreadCount: number;
  selectedSize: number;
  onDeleteSelected: () => void;
  page: number;
  totalPages: number;
  total: number;
  onChangePage: (p: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-3 border-y border-border">
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
        <span className="text-sm text-muted-foreground font-medium">Itens por página:</span>
        <span className="text-sm font-semibold text-foreground">10</span>
      </div>

      <div className="flex items-center gap-1 ml-2">
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

      {selectedSize > 0 && (
        <button
          type="button"
          onClick={onDeleteSelected}
          className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-semibold hover:bg-destructive/20 transition-colors cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Excluir ({selectedSize})
        </button>
      )}

      <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          Página {page} de {totalPages} ({total} itens)
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => onChangePage(page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => onChangePage(page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

NotificationsToolbar.displayName = "NotificationsToolbar";

export default NotificationsToolbar;