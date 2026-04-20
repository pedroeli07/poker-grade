"use client";

import { Check, Trash2 } from "lucide-react";
import PaginationToolbarControls from "@/components/data-table/pagination-toolbar-controls";
import { cn } from "@/lib/utils";
import { memo, type ReactNode } from "react";

const HistoryToolbar = memo(function HistoryToolbar({
  page,
  pageSize,
  total,
  totalPages,
  selectedSize,
  allSelected,
  onToggleAll,
  onChangePage,
  onChangePageSize,
  onDeleteSelected,
  hasItems,
  centerContent,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  selectedSize: number;
  allSelected: boolean;
  onToggleAll: () => void;
  onChangePage: (p: number) => void;
  onChangePageSize: (s: number) => void;
  onDeleteSelected: () => void;
  hasItems: boolean;
  /** Filtros centralizados (ex.: admin); omitir em visão jogador. */
  centerContent?: ReactNode;
}) {
  return (
    <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-3 rounded-lg border border-border/50 bg-muted/20 p-2 sm:p-3">
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleAll}
          disabled={!hasItems}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
            allSelected
              ? "border-red-500 bg-red-500"
              : "border-border hover:border-red-500/50"
          )}
        >
          {allSelected && <Check className="h-3 w-3 text-white" />}
        </button>
      </div>

      {centerContent != null && (
        <div className="flex min-w-0 flex-1 basis-[min(100%,280px)] flex-wrap items-center justify-center gap-2">
          {centerContent}
        </div>
      )}

      <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-3 sm:gap-4">
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

HistoryToolbar.displayName = "HistoryToolbar";

export default HistoryToolbar;
