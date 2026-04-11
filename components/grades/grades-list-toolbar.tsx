"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import GradesListColFilters from "@/components/grades/grades-list-col-filters";
import type { GradesColumnFilters, GradesColumnOptions, GradesSetCol } from "@/lib/types";
import { memo } from "react";

const GradesListToolbar = memo(function GradesListToolbar({
  view,
  setView,
  options,
  filters,
  setCol,
  filteredCount,
  totalCount,
  anyFilter,
  clearFilters,
}: {
  view: "cards" | "table";
  setView: (v: "cards" | "table") => void;
  options: GradesColumnOptions;
  filters: GradesColumnFilters;
  setCol: GradesSetCol;
  filteredCount: number;
  totalCount: number;
  anyFilter: boolean;
  clearFilters: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
      <div
        className="inline-flex shrink-0 rounded-lg border border-border p-0.5 bg-muted/30"
        role="group"
        aria-label="Modo de visualização"
      >
        {(["cards", "table"] as const).map((v) => (
          <Button
            key={v}
            type="button"
            variant={view === v ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "gap-2 h-8 text-xs",
              view === v && "bg-primary/12 text-primary shadow-none"
            )}
            onClick={() => setView(v)}
          >
            {v === "cards" ? (
              <LayoutGrid className="h-3.5 w-3.5" />
            ) : (
              <Table2 className="h-3.5 w-3.5" />
            )}
            {v === "cards" ? "Cards" : "Tabela"}
          </Button>
        ))}
      </div>

      {view === "cards" && (
        <div className="flex flex-1 flex-col gap-2 min-w-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <span className="text-xs font-medium text-muted-foreground shrink-0 sm:mr-1">Filtros</span>
          <div className="flex flex-wrap items-center gap-2">
            <GradesListColFilters
              compact
              options={options}
              filters={filters}
              setCol={setCol}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground shrink-0">
        <span>
          <span className="font-medium text-foreground">{filteredCount}</span>
          {" / "}
          <span className="font-medium text-foreground">{totalCount}</span>
          {" grades"}
        </span>
        {anyFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-primary"
            onClick={clearFilters}
          >
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
});

GradesListToolbar.displayName = "GradesListToolbar";

export default GradesListToolbar;
