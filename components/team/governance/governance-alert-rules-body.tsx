"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import DataTableShell from "@/components/data-table/data-table-shell";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import GovernanceAlertRulesTableHeadFilters from "@/components/team/governance/governance-alert-rules-table-head-filters";
import { GovernanceAlertRuleCard } from "@/components/team/governance/governance-alert-rule-card";
import GovernanceAlertRulesTableRow from "@/components/team/governance/governance-alert-rules-table-row";
import { memo, useMemo } from "react";
import type { GovernanceAlertRuleDTO } from "@/lib/data/team/governance-page";
import type { GovernanceAlertRulesSetCol } from "@/lib/types/team/governance-alert-rules-list";
import type {
  GovernanceAlertRuleColumnFilters,
  GovernanceAlertRuleColumnOptions,
} from "@/lib/types/team/governance-alert-rules-list";
import type { GovernanceAlertRuleSortKey } from "@/lib/types/team/governance-alert-rules-list";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import { dataTableHeaderRowActiveRingClass, dataTableHeaderRowClass } from "@/lib/constants/classes";
import {
  buildGovernanceAlertRuleFilterSummaryLines,
  formatAlertRulesTableSortSummary,
} from "@/lib/utils/team/governance-alert-rules-filters";
import type { SortDir } from "@/lib/table-sort";

const RulesEmptyState = memo(function RulesEmptyState({
  hasActiveView,
  onClear,
  compact,
}: {
  hasActiveView: boolean;
  onClear: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="text-muted-foreground text-sm">
        Nenhuma regra com a seleção atual.{" "}
        {hasActiveView && (
          <Button type="button" variant="link" className="h-auto p-0 text-primary" onClick={onClear}>
            Limpar
          </Button>
        )}
      </div>
    );
  }
  return (
    <Card className="border-dashed bg-muted/15 py-16 text-center">
      <p className="text-foreground/85 font-medium">Nenhuma regra com a seleção atual.</p>
      <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
        Ajuste a busca, os filtros de coluna ou a ordenação, ou crie uma nova regra.
      </p>
      {hasActiveView && (
        <div className="mt-4">
          <Button type="button" variant="link" className="text-primary" onClick={onClear}>
            Limpar busca, filtros e ordenação
          </Button>
        </div>
      )}
    </Card>
  );
});
RulesEmptyState.displayName = "RulesEmptyState";

const GovernanceAlertRulesBody = memo(function GovernanceAlertRulesBody({
  view,
  options,
  filters,
  setCol,
  anyFilter,
  clearTableView,
  tableRows,
  matchedCount,
  hasActiveView,
  sort,
  onSort,
  onEdit,
  onRequestDelete,
}: {
  view: "cards" | "table";
  options: GovernanceAlertRuleColumnOptions;
  filters: GovernanceAlertRuleColumnFilters;
  setCol: GovernanceAlertRulesSetCol;
  anyFilter: boolean;
  clearTableView: () => void;
  tableRows: GovernanceAlertRuleDTO[];
  matchedCount: number;
  hasActiveView: boolean;
  sort: { key: GovernanceAlertRuleSortKey; dir: SortDir } | null;
  onSort: (k: GovernanceAlertRuleSortKey, kind: ColumnSortKind) => void;
  onEdit: (r: GovernanceAlertRuleDTO) => void;
  onRequestDelete: (id: string) => void;
}) {
  const filterSummaryLines = useMemo(
    () => buildGovernanceAlertRuleFilterSummaryLines(options, filters),
    [options, filters],
  );
  const sortSummary = useMemo(
    () => formatAlertRulesTableSortSummary(sort),
    [sort],
  );

  if (view === "cards") {
    if (matchedCount === 0) {
      return <RulesEmptyState hasActiveView={hasActiveView} onClear={clearTableView} />;
    }
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tableRows.map((rule) => (
          <GovernanceAlertRuleCard
            key={rule.id}
            rule={rule}
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DataTableToolbar
        filteredCount={tableRows.length}
        totalCount={matchedCount}
        entityLabels={["regra", "regras"]}
        hasActiveView={hasActiveView}
        anyFilter={anyFilter}
        sortSummary={sortSummary}
        filterSummaryLines={filterSummaryLines}
        onClear={clearTableView}
        filterChipsSectionTitle="Filtros e busca ativos"
        hideShowingCount
      />
      <DataTableShell hasActiveView={hasActiveView}>
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <Table className="min-w-[1000px] w-full table-fixed">
            <TableHeader>
              <TableRow
                className={cn(
                  "border-b border-border",
                  cardClassName,
                  dataTableHeaderRowClass,
                  hasActiveView && dataTableHeaderRowActiveRingClass,
                )}
              >
                <GovernanceAlertRulesTableHeadFilters
                  options={options}
                  filters={filters}
                  setCol={setCol}
                  sort={sort}
                  onSort={onSort}
                />
                <TableHead className="w-10 p-0 text-center align-middle" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchedCount === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center">
                    <RulesEmptyState
                      hasActiveView={hasActiveView}
                      onClear={clearTableView}
                      compact
                    />
                  </TableCell>
                </TableRow>
              ) : (
                tableRows.map((rule) => (
                  <GovernanceAlertRulesTableRow
                    key={rule.id}
                    rule={rule}
                    onEdit={onEdit}
                    onRequestDelete={onRequestDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DataTableShell>
    </div>
  );
});

GovernanceAlertRulesBody.displayName = "GovernanceAlertRulesBody";

export default GovernanceAlertRulesBody;
