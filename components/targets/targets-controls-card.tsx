"use client";

import { memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import TargetsColFilters from "@/components/targets/targets-col-filters";
import TargetsCardsSection from "@/components/targets/targets-cards-section";
import TargetsTableSection from "@/components/targets/targets-table-section";
import TargetsViewToggle from "@/components/targets/targets-view-toggle";
import type { ColKey, Filters, TargetListRow, TargetsColumnOptions } from "@/lib/types";
import { buildTargetsFilterSummaryLines } from "@/lib/utils/target";

const TargetsControlsCard = memo(function TargetsControlsCard({
  view,
  setView,
  options,
  filters,
  setCol,
  rows,
  filtered,
  anyFilter,
  clearFilters,
}: {
  view: "cards" | "table";
  setView: (v: "cards" | "table") => void;
  options: TargetsColumnOptions;
  filters: Filters;
  setCol: (col: ColKey) => (next: Set<string> | null) => void;
  rows: TargetListRow[];
  filtered: TargetListRow[];
  anyFilter: boolean;
  clearFilters: () => void;
}) {
  const cardsFilterLines = useMemo(
    () => buildTargetsFilterSummaryLines(filters, options),
    [filters, options]
  );

  return (
    <Card className="overflow-hidden rounded-xl border border-border/80 bg-card/60 shadow-sm">
      <CardHeader className="border-b border-border/40 bg-muted/10 px-6 pb-5 pt-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              Controle de Targets
            </CardTitle>
            <CardDescription className="mt-1">
              Gerencie e acompanhe todos os targets ativos dos jogadores.
            </CardDescription>
          </div>
          <TargetsViewToggle view={view} setView={setView} />
        </div>

        {view === "cards" && (
          <div className="mt-4 flex min-w-0 flex-col gap-2 sm:mr-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
           
            <div className="flex flex-wrap items-center gap-2">
              <TargetsColFilters compact options={options} filters={filters} setCol={setCol} />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {view === "cards" && (
          <DataTableToolbar
            filteredCount={filtered.length}
            totalCount={rows.length}
            entityLabels={["target", "targets"]}
            hasActiveView={anyFilter}
            anyFilter={anyFilter}
            sortSummary={null}
            filterSummaryLines={cardsFilterLines}
            onClear={clearFilters}
          />
        )}
        {view === "cards" ? (
          <TargetsCardsSection filtered={filtered} anyFilter={anyFilter} onClearFilters={clearFilters} />
        ) : (
          <div className="px-0 pb-0 pt-0">
            <TargetsTableSection
              filtered={filtered}
              options={options}
              filters={filters}
              setCol={setCol}
              totalCount={rows.length}
              anyFilter={anyFilter}
              clearFilters={clearFilters}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TargetsControlsCard.displayName = "TargetsControlsCard";

export default TargetsControlsCard;
