"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ColumnFilter from "@/components/column-filter";
import { memo, useMemo } from "react";
import type { GradeRulesColumnFilters, GradeRulesColumnOptions, GradeRulesColumnKey } from "@/hooks/grades/use-grade-rules-list";

/** Filtros na toolbar em modo cards (um botão por dimensão). */
const CARD_TOOLBAR_FILTERS: [GradeRulesColumnKey, string][] = [
  ["filterName", "Regra"],
  ["buyIn", "Buy-in"],
  ["prizePool", "Garantido"],
  ["excludePattern", "Excluir"],
  ["sites", "Sites"],
  ["speed", "Velocidade"],
  ["variant", "Variante"],
  ["tournamentType", "Tipo"],
  ["gameType", "Tipo de jogo"],
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
  const hasCardFilterOptions = useMemo(() => {
    return CARD_TOOLBAR_FILTERS.some(([col]) => options[col].length > 0);
  }, [options]);

  const countLabel = (
    <span className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{filteredCount}</span>
      {" / "}
      <span className="font-medium text-foreground">{totalCount}</span>
      {" regras"}
    </span>
  );

  return (
    <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-4">
      <div className="flex items-center justify-between gap-2 lg:justify-start">
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
        <div className="shrink-0 lg:hidden">{countLabel}</div>
      </div>

      {view === "cards" && hasCardFilterOptions ? (
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
          {CARD_TOOLBAR_FILTERS.map(([col, label]) => {
            if (options[col].length === 0) return null;
            return (
              <ColumnFilter
                key={col}
                columnId={col}
                label={label}
                options={options[col]}
                applied={filters[col]}
                onApply={setCol(col)}
                compact
              />
            );
          })}
          {anyFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 px-2 text-xs text-primary"
              onClick={clearFilters}
            >
              Limpar
            </Button>
          )}
        </div>
      ) : (
        <div className="hidden min-w-0 lg:block" aria-hidden="true" />
      )}

      <div className="hidden shrink-0 flex-col items-end gap-2 lg:flex">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {countLabel}
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
    </div>
  );
});

GradeRulesToolbar.displayName = "GradeRulesToolbar";

export default GradeRulesToolbar;
