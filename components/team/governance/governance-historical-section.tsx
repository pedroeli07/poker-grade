"use client";

import { useGovernanceHistoricalList } from "@/hooks/team/use-governance-historical-list";
import type { GovernanceDecisionDTO } from "@/lib/data/team/governance-page";
import GovernanceHistoricalToolbar from "@/components/team/governance/governance-historical-toolbar";
import GovernanceHistoricalBody from "@/components/team/governance/governance-historical-body";

export type GovernanceHistoricalSectionProps = {
  decisions: GovernanceDecisionDTO[];
  onEditDecision: (d: GovernanceDecisionDTO) => void;
  onRequestDeleteDecision: (id: string) => void;
};

export function GovernanceHistoricalSection({
  decisions,
  onEditDecision,
  onRequestDeleteDecision,
}: GovernanceHistoricalSectionProps) {
  const {
    view,
    setView,
    viewHydrated,
    pageSizeHydrated,
    page,
    pageSize,
    totalPages,
    changePage,
    changePageSize,
    filters,
    setCol,
    options,
    paginatedRows,
    matchedCount,
    totalCount,
    anyFilter,
    clearFilters,
    clearTableView,
    hasActiveView,
    sort,
    onSort,
  } = useGovernanceHistoricalList(decisions);

  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Deliberações</h3>
        <p className="text-sm text-muted-foreground whitespace-nowrap overflow-x-auto [scrollbar-width:thin]">
          {
            "Consulte, filtre e ordene o histórico. Na vista em tabela, use os filtros em cada coluna, como em Perfis de Grades."
          }
        </p>
      </div>
      <div className="space-y-4">
        {!viewHydrated || !pageSizeHydrated ? (
          <div className="min-h-[240px] rounded-2xl border border-dashed border-border/60 bg-muted/20" aria-busy />
        ) : (
          <>
            <GovernanceHistoricalToolbar
              view={view}
              setView={setView}
              options={options}
              filters={filters}
              setCol={setCol}
              matchedCount={matchedCount}
              totalCount={totalCount}
              anyFilter={anyFilter}
              clearFilters={clearFilters}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              onChangePage={changePage}
              onChangePageSize={changePageSize}
              pageItemCount={paginatedRows.length}
            />
            <GovernanceHistoricalBody
              view={view}
              options={options}
              filters={filters}
              setCol={setCol}
              anyFilter={anyFilter}
              clearTableView={clearTableView}
              tableRows={paginatedRows}
              matchedCount={matchedCount}
              hasActiveView={hasActiveView}
              sort={sort}
              onSort={onSort}
              onEditDecision={onEditDecision}
              onRequestDeleteDecision={onRequestDeleteDecision}
            />
          </>
        )}
      </div>
    </div>
  );
}
