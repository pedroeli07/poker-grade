"use client";

import { useGovernanceAlertRulesList } from "@/hooks/team/use-governance-alert-rules-list";
import type { GovernanceAlertRuleDTO } from "@/lib/data/team/governance-page";
import GovernanceAlertRulesToolbar from "@/components/team/governance/governance-alert-rules-toolbar";
import GovernanceAlertRulesBody from "@/components/team/governance/governance-alert-rules-body";

export function GovernanceAlertRulesSection({
  rules: initialRules,
  onNew,
  onEdit,
  onRequestDelete,
}: {
  rules: GovernanceAlertRuleDTO[];
  onNew: () => void;
  onEdit: (r: GovernanceAlertRuleDTO) => void;
  onRequestDelete: (id: string) => void;
}) {
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
  } = useGovernanceAlertRulesList(initialRules);

  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Regras de alerta</h3>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Consulte, filtre e ordene as regras. Na vista em tabela, use os filtros em cada coluna, como no
          histórico{"\u00A0"}de deliberações.
        </p>
      </div>
      <div className="space-y-4">


        {!viewHydrated || !pageSizeHydrated ? (
          <div className="min-h-[240px] rounded-2xl border border-dashed border-border/60 bg-muted/20" aria-busy />
        ) : (
          <>
            <GovernanceAlertRulesToolbar
              view={view}
              setView={setView}
              onNew={onNew}
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
            <GovernanceAlertRulesBody
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
              onEdit={onEdit}
              onRequestDelete={onRequestDelete}
            />
          </>
        )}
      </div>
    </div>
  );
}
