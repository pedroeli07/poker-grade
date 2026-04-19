"use client";

import { LayoutGrid, Table2, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ColumnFilter from "@/components/column-filter";
import { memo, useMemo } from "react";
import type { GradeRulesColumnFilters, GradeRulesColumnOptions, GradeRulesColumnKey } from "@/hooks/grades/use-grade-rules-list";

const FILTER_COLUMNS: [GradeRulesColumnKey, string][] = [
  ["sites", "Sites"],
  ["gameType", "Game Type"],
  ["speed", "Velocidade"],
  ["tournamentType", "Tipo de Torneio"],
  ["playerCount", "Field"],
  ["variant", "Variante"],
];

const GradeRulesToolbar = memo(function GradeRulesToolbar({
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
  options: GradeRulesColumnOptions;
  filters: GradeRulesColumnFilters;
  setCol: (col: GradeRulesColumnKey) => (next: Set<string> | null) => void;
  filteredCount: number;
  totalCount: number;
  anyFilter: boolean;
  clearFilters: () => void;
}) {
  const hasOptions = useMemo(() => {
    return FILTER_COLUMNS.some(([col]) => options[col].length > 0);
  }, [options]);

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        "flex-col lg:flex-row lg:items-center justify-between"
      )}
    >
      <div className="flex items-center gap-2">
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

        {view === "cards" && hasOptions && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={anyFilter ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "h-8 gap-2 text-xs",
                  anyFilter && "bg-primary/10 text-primary border-primary/20"
                )}
              >
                <ListFilter className="h-3.5 w-3.5" />
                Filtros
                {anyFilter && (
                  <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] leading-none text-primary">
                    {Object.values(filters).filter((f) => f && f.size > 0).length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[320px] p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium leading-none">Filtros de Regra</h4>
                  {anyFilter && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:underline"
                      onClick={clearFilters}
                    >
                      Limpar
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {FILTER_COLUMNS.map(([col, label]) => {
                    if (options[col].length === 0) return null;
                    return (
                      <div key={col} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <ColumnFilter
                          columnId={col}
                          label={label}
                          options={options[col]}
                          applied={filters[col]}
                          onApply={setCol(col)}
                          compact
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{filteredCount}</span>
          {" / "}
          <span className="font-medium text-foreground">{totalCount}</span>
          {" regras"}
        </span>
        {anyFilter && view === "table" && (
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
    </div>
  );
});

GradeRulesToolbar.displayName = "GradeRulesToolbar";

export default GradeRulesToolbar;
