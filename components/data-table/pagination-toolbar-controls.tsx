"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

/** Mesmo bloco de “Itens” + paginação usado em Notificações e Histórico. */
const PaginationToolbarControls = memo(function PaginationToolbarControls({
  page,
  pageSize,
  total,
  totalPages,
  onChangePage,
  onChangePageSize,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onChangePage: (p: number) => void;
  onChangePageSize: (size: number) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground font-medium">Itens:</span>
        <select
          value={pageSize > 100 ? "all" : pageSize}
          onChange={(e) => {
            const val = e.target.value;
            onChangePageSize(val === "all" ? 10000 : Number(val));
          }}
          className="text-sm font-semibold text-foreground bg-transparent border border-border rounded-md px-2 py-1 outline-none focus:border-primary/50 cursor-pointer"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={"all"}>Todos</option>
        </select>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          Página {page} de {totalPages}{" "}
          <span className="hidden sm:inline">({total} itens)</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => onChangePage(page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => onChangePage(page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
});

PaginationToolbarControls.displayName = "PaginationToolbarControls";

export default PaginationToolbarControls;
