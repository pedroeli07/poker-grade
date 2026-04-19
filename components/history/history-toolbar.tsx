"use client";

import { Check, Trash2 } from "lucide-react";
import PaginationToolbarControls from "@/components/data-table/pagination-toolbar-controls";
import { cn } from "@/lib/utils";
import { memo } from "react";

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
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-border">
      {/* Esquerda */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleAll}
            disabled={!hasItems}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
              allSelected ? "bg-primary border-primary" : "border-border hover:border-primary/60"
            )}
          >
            {allSelected && <Check className="h-3 w-3 text-white" />}
          </button>
        </div>
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
