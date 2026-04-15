"use client";

import { memo } from "react";
import { ArrowDownWideNarrow, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  dataTableToolbarActiveClass,
  dataTableToolbarIdleClass,
} from "@/lib/constants";
import type { DataTableToolbarProps } from "@/lib/types/dataTable";

const DataTableToolbar = memo(function DataTableToolbar({
  showingLabel = "Mostrando",
  filteredCount,
  totalCount,
  entityLabels,
  hasActiveView,
  anyFilter,
  sortSummary,
  filterSummaryLines,
  onClear,
  clearButtonLabel = "Limpar filtros e ordenação",
  filterChipsSectionTitle = "Valores filtrados",
}: DataTableToolbarProps) {
  const [entitySingular, entityPlural] = entityLabels;
  const entityWord = totalCount !== 1 ? entityPlural : entitySingular;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-4 py-2 text-sm transition-all duration-300",
        hasActiveView ? dataTableToolbarActiveClass : dataTableToolbarIdleClass
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
          <span className={cn(hasActiveView && "font-medium text-foreground")}>
            {showingLabel}{" "}
            <span className="font-semibold tabular-nums text-primary">{filteredCount}</span> de{" "}
            <span className="tabular-nums">{totalCount}</span> {entityWord}
          </span>
          {hasActiveView && (
            <div className="flex flex-wrap items-center gap-2">
              {anyFilter && (
                <Badge className="gap-1 border-primary/30 bg-primary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary shadow-sm">
                  <Filter className="h-3 w-3" aria-hidden />
                  Filtros ativos
                </Badge>
              )}
              {sortSummary && (
                <Badge
                  variant="outline"
                  className="gap-1 border-primary/40 bg-background/80 px-2 py-0.5 text-[11px] font-semibold text-primary shadow-sm"
                >
                  <ArrowDownWideNarrow className="h-3 w-3" aria-hidden />
                  Ordenação: {sortSummary}
                </Badge>
              )}
            </div>
          )}
        </div>
        {hasActiveView && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 shrink-0 border-primary/25 bg-background/90 text-xs font-medium text-primary hover:bg-primary/10"
            onClick={onClear}
          >
            {clearButtonLabel}
          </Button>
        )}
      </div>
      {anyFilter && filterSummaryLines.length > 0 && (
        <div className="border-t border-primary/20 pt-2">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary/90">
            {filterChipsSectionTitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {filterSummaryLines.map((line, i) => (
              <span
                key={i}
                className="inline-flex max-w-full break-words rounded-md border border-primary/30 bg-background/85 px-2 py-1 text-[11px] leading-snug text-foreground shadow-sm"
              >
                {line}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

DataTableToolbar.displayName = "DataTableToolbar";

export default DataTableToolbar;
