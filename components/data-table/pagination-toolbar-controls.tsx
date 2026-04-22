"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, type ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Mesmo bloco de “Itens” + paginação usado em Notificações e Histórico. */
const PaginationToolbarControls = memo(function PaginationToolbarControls({
  countSummary,
  page,
  pageSize,
  total,
  totalPages,
  onChangePage,
  onChangePageSize,
}: {
  /** Ex.: “Mostrando 10 de 10 decisões” imediatamente à esquerda de Itens. */
  countSummary?: ReactNode;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onChangePage: (p: number) => void;
  onChangePageSize: (size: number) => void;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {countSummary}
        <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground font-medium">Itens:</span>
        <Select
          value={String(pageSize > 100 ? "all" : pageSize)}
          onValueChange={(val) => {
            onChangePageSize(val === "all" ? 10000 : Number(val));
          }}
        >
          <SelectTrigger className="h-8 w-[85px] bg-background font-semibold text-foreground border-border hover:border-primary/50 hover:bg-muted/50 transition-colors shadow-sm focus:ring-primary/20">
            <SelectValue placeholder={String(pageSize > 100 ? "Todos" : pageSize)} />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
        </div>
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground bg-blue-400/20 hover:bg-blue-400/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => onChangePage(page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-semibold text-foreground bg-blue-400/20 hover:bg-blue-400/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
