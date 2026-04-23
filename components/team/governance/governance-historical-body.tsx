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
import GovernanceHistoricalTableHeadFilters from "@/components/team/governance/governance-historical-table-head-filters";
import { GovernanceDecisionCard } from "./governance-decision-card";
import GovernanceHistoricalTableRow from "@/components/team/governance/governance-historical-table-row";
import { GOVERNANCE_AREA_ICONS } from "./governance-area-icons";
import { memo, useMemo } from "react";
import type { GovernanceDecisionDTO } from "@/lib/data/team/governance-page";
import type { GovernanceDecisionsSetCol } from "@/lib/types/team/governance-historical";
import type {
  GovernanceDecisionColumnFilters,
  GovernanceDecisionColumnOptions,
} from "@/lib/types/team/governance-historical";
import type { GovernanceDecisionSortKey } from "@/lib/types/team/governance-historical";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import { dataTableHeaderRowActiveRingClass, dataTableHeaderRowClass } from "@/lib/constants/classes";
import {
  buildGovernanceFilterSummaryLines,
  formatGovernanceTableSortSummary,
} from "@/lib/utils/team/governance-historical-filters";
import type { SortDir } from "@/lib/table-sort";

const DecisionsEmptyState = memo(function DecisionsEmptyState({
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
        Nenhuma decisão com a seleção atual.{" "}
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
      <p className="text-foreground/85 font-medium">Nenhuma decisão com a seleção atual.</p>
      <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
        Ajuste a busca, os filtros de coluna ou a ordenação, ou crie uma nova deliberação.
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
DecisionsEmptyState.displayName = "DecisionsEmptyState";

const GovernanceHistoricalBody = memo(function GovernanceHistoricalBody({
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
  onEditDecision,
  onRequestDeleteDecision,
}: {
  view: "cards" | "table";
  options: GovernanceDecisionColumnOptions;
  filters: GovernanceDecisionColumnFilters;
  setCol: GovernanceDecisionsSetCol;
  anyFilter: boolean;
  clearTableView: () => void;
  /** Linhas da página atual (cards ou tabela) */
  tableRows: GovernanceDecisionDTO[];
  /** Total após busca, filtros e ordenação (antes de paginar) */
  matchedCount: number;
  hasActiveView: boolean;
  sort: { key: GovernanceDecisionSortKey; dir: SortDir } | null;
  onSort: (k: GovernanceDecisionSortKey, kind: ColumnSortKind) => void;
  onEditDecision: (d: GovernanceDecisionDTO) => void;
  onRequestDeleteDecision: (id: string) => void;
}) {
  const filterSummaryLines = useMemo(
    () => buildGovernanceFilterSummaryLines(options, filters),
    [options, filters],
  );
  const sortSummary = useMemo(
    () => formatGovernanceTableSortSummary(sort),
    [sort],
  );

  if (view === "cards") {
    if (matchedCount === 0) {
      return <DecisionsEmptyState hasActiveView={hasActiveView} onClear={clearTableView} />;
    }
    return (
      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tableRows.map((dec) => (
          <GovernanceDecisionCard
            key={dec.id}
            decision={dec}
            onEdit={onEditDecision}
            onRequestDelete={onRequestDeleteDecision}
            areaIcon={GOVERNANCE_AREA_ICONS[dec.area] ?? null}
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
        entityLabels={["decisão", "decisões"]}
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
          <Table className="min-w-[1200px] w-full table-fixed">
            <TableHeader>
              <TableRow
                className={cn(
                  "border-b border-border",
                  cardClassName,
                  dataTableHeaderRowClass,
                  hasActiveView && dataTableHeaderRowActiveRingClass,
                )}
              >
                <GovernanceHistoricalTableHeadFilters
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
                  <TableCell colSpan={8} className="py-10 text-center">
                    <DecisionsEmptyState
                      hasActiveView={hasActiveView}
                      onClear={clearTableView}
                      compact
                    />
                  </TableCell>
                </TableRow>
              ) : (
                tableRows.map((dec) => (
                  <GovernanceHistoricalTableRow
                    key={dec.id}
                    decision={dec}
                    onEdit={onEditDecision}
                    onRequestDelete={onRequestDeleteDecision}
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

GovernanceHistoricalBody.displayName = "GovernanceHistoricalBody";

export default GovernanceHistoricalBody;
