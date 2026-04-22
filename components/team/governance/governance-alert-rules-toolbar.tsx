"use client";

import { LayoutGrid, Plus, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { memo } from "react";
import PaginationToolbarControls from "@/components/data-table/pagination-toolbar-controls";
import GovernanceAlertRulesColFilters from "@/components/team/governance/governance-alert-rules-col-filters";
import type {
  GovernanceAlertRuleColumnFilters,
  GovernanceAlertRuleColumnOptions,
  GovernanceAlertRulesSetCol,
} from "@/lib/types/team/governance-alert-rules-list";

const GovernanceAlertRulesToolbar = memo(function GovernanceAlertRulesToolbar({
  view,
  setView,
  onNew,
  options,
  filters,
  setCol,
  matchedCount,
  totalCount,
  anyFilter,
  clearFilters,
  page,
  pageSize,
  totalPages,
  onChangePage,
  onChangePageSize,
  pageItemCount,
}: {
  view: "cards" | "table";
  setView: (v: "cards" | "table") => void;
  onNew: () => void;
  options: GovernanceAlertRuleColumnOptions;
  filters: GovernanceAlertRuleColumnFilters;
  setCol: GovernanceAlertRulesSetCol;
  matchedCount: number;
  totalCount: number;
  pageItemCount: number;
  anyFilter: boolean;
  clearFilters: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onChangePage: (p: number) => void;
  onChangePageSize: (size: number) => void;
}) {
  return (
    <div
      className={cn(
        "flex w-full gap-3",
        view === "cards"
          ? "flex-col lg:flex-row lg:items-center"
          : "flex-col sm:flex-row sm:items-center sm:justify-between",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 flex-nowrap items-center gap-4",
          view === "cards" && "mx-auto lg:mx-0",
        )}
      >
        <div
          className="inline-flex shrink-0 rounded-lg border border-border bg-muted/30 p-0.5"
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
                "h-8 gap-2 text-xs",
                view === v && "bg-primary/12 text-primary shadow-none",
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
        <Button type="button" className="gap-2 rounded-xl shadow-sm" onClick={onNew}>
          <Plus className="h-4 w-4" />
          Nova regra
        </Button>
      </div>

      {view === "cards" && (
        <div className="flex min-w-0 flex-1 justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <GovernanceAlertRulesColFilters
              compact
              options={options}
              filters={filters}
              setCol={setCol}
            />
          </div>
        </div>
      )}

      {view === "cards" && (
        <div
          className={cn(
            "flex w-full min-w-0 flex-col items-center gap-3 text-sm text-muted-foreground",
            "lg:ml-auto lg:max-w-none lg:flex-1 lg:flex-row lg:justify-end lg:gap-4",
          )}
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>
              <span className="font-medium text-foreground">{matchedCount}</span>
              {" / "}
              <span className="font-medium text-foreground">{totalCount}</span>
              {" regras"}
            </span>
            {anyFilter && (
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
          <div className="flex flex-wrap items-center justify-center gap-3 lg:shrink-0">
            <PaginationToolbarControls
              page={page}
              pageSize={pageSize}
              total={matchedCount}
              totalPages={totalPages}
              onChangePage={onChangePage}
              onChangePageSize={onChangePageSize}
            />
          </div>
        </div>
      )}

      {view === "table" && (
        <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          <div className="flex flex-wrap items-center justify-end gap-3 sm:shrink-0">
            <PaginationToolbarControls
              countSummary={
                <span className="text-sm text-muted-foreground sm:text-right">
                  Mostrando{" "}
                  <span className="font-medium text-foreground tabular-nums">{pageItemCount}</span> de{" "}
                  <span className="font-medium text-foreground tabular-nums">{matchedCount}</span>{" "}
                  {matchedCount === 1 ? "regra" : "regras"}
                </span>
              }
              page={page}
              pageSize={pageSize}
              total={matchedCount}
              totalPages={totalPages}
              onChangePage={onChangePage}
              onChangePageSize={onChangePageSize}
            />
          </div>
        </div>
      )}
    </div>
  );
});

GovernanceAlertRulesToolbar.displayName = "GovernanceAlertRulesToolbar";

export default GovernanceAlertRulesToolbar;
