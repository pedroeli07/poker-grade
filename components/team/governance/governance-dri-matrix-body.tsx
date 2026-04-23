"use client";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import DataTableShell from "@/components/data-table/data-table-shell";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import GovernanceDriTableHeadFilters from "@/components/team/governance/governance-dri-table-head-filters";
import GovernanceDriMatrixTableRow from "@/components/team/governance/governance-dri-matrix-table-row";
import { memo, useMemo } from "react";
import type { GovernanceDriDTO } from "@/lib/data/team/governance-page";
import type {
  GovernanceDriSetCol,
  GovernanceDriColumnFilters,
  GovernanceDriColumnOptions,
  GovernanceDriSortKey,
} from "@/lib/types/team/governance-dri-matrix";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import { dataTableHeaderRowActiveRingClass, dataTableHeaderRowClass } from "@/lib/constants/classes";
import { buildDriFilterSummaryLines, formatDriTableSortSummary } from "@/lib/utils/team/governance-dri-filters";
import type { SortDir } from "@/lib/table-sort";

const DriEmptyState = memo(function DriEmptyState({
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
        Nenhuma área com a seleção atual.{" "}
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
      <p className="text-foreground/85 font-medium">Nenhuma área com a seleção atual.</p>
      <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
        Ajuste os filtros de coluna ou a ordenação.
      </p>
      {hasActiveView && (
        <div className="mt-4">
          <Button type="button" variant="link" className="text-primary" onClick={onClear}>
            Limpar filtros e ordenação
          </Button>
        </div>
      )}
    </Card>
  );
});
DriEmptyState.displayName = "DriEmptyState";

const GovernanceDriMatrixBody = memo(function GovernanceDriMatrixBody({
  options,
  filters,
  setCol,
  anyFilter,
  clearTableView,
  tableRows,
  matchedCount,
  totalCount,
  hasActiveView,
  sort,
  onSort,
  onEdit,
  onRequestDelete,
}: {
  options: GovernanceDriColumnOptions;
  filters: GovernanceDriColumnFilters;
  setCol: GovernanceDriSetCol;
  anyFilter: boolean;
  clearTableView: () => void;
  tableRows: GovernanceDriDTO[];
  matchedCount: number;
  totalCount: number;
  hasActiveView: boolean;
  sort: { key: GovernanceDriSortKey; dir: SortDir } | null;
  onSort: (k: GovernanceDriSortKey, kind: ColumnSortKind) => void;
  onEdit: (d: GovernanceDriDTO) => void;
  onRequestDelete: (id: string) => void;
}) {
  const filterSummaryLines = useMemo(
    () => buildDriFilterSummaryLines(options, filters),
    [options, filters],
  );
  const sortSummary = useMemo(() => formatDriTableSortSummary(sort), [sort]);

  if (totalCount === 0) {
    return (
      <div className="overflow-x-auto rounded-xl border border-border bg-card py-12 text-center text-muted-foreground">
        Nenhum DRI cadastrado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DataTableToolbar
        filteredCount={tableRows.length}
        totalCount={matchedCount}
        entityLabels={["área", "áreas"]}
        hasActiveView={hasActiveView}
        anyFilter={anyFilter}
        sortSummary={sortSummary}
        filterSummaryLines={filterSummaryLines}
        onClear={clearTableView}
        filterChipsSectionTitle="Filtros e ordenação ativos"
        hideShowingCount
      />
      <DataTableShell hasActiveView={hasActiveView}>
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <Table className="min-w-[900px] w-full table-fixed">
            <TableHeader>
              <TableRow
                className={cn(
                  "border-b border-border",
                  cardClassName,
                  dataTableHeaderRowClass,
                  hasActiveView && dataTableHeaderRowActiveRingClass,
                )}
              >
                <GovernanceDriTableHeadFilters
                  options={options}
                  filters={filters}
                  setCol={setCol}
                  sort={sort}
                  onSort={onSort}
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchedCount === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center">
                    <DriEmptyState hasActiveView={hasActiveView} onClear={clearTableView} compact />
                  </TableCell>
                </TableRow>
              ) : (
                tableRows.map((dri) => (
                  <GovernanceDriMatrixTableRow
                    key={dri.id}
                    dri={dri}
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

GovernanceDriMatrixBody.displayName = "GovernanceDriMatrixBody";

export default GovernanceDriMatrixBody;
