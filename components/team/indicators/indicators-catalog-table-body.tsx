"use client";

import { memo, useMemo } from "react";
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
import IndicatorsCatalogTableHeadFilters from "@/components/team/indicators/indicators-catalog-table-head-filters";
import IndicatorsCatalogTableRow from "@/components/team/indicators/indicators-catalog-table-row";
import type { TeamIndicatorDTO } from "@/lib/data/team/indicators-page";
import type { IndicatorsCatalogSetCol } from "@/lib/types/team/indicators-catalog-list";
import type {
  IndicatorCatalogColumnFilters,
  IndicatorCatalogColumnOptions,
} from "@/lib/types/team/indicators-catalog-list";
import type { IndicatorCatalogSortKey } from "@/lib/types/team/indicators-catalog-list";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import { dataTableHeaderRowActiveRingClass, dataTableHeaderRowClass } from "@/lib/constants/classes";
import {
  buildIndicatorCatalogFilterSummaryLines,
  formatIndicatorCatalogSortSummary,
} from "@/lib/utils/team/indicators-catalog-filters";
import type { SortDir } from "@/lib/table-sort";

const CatalogEmptyState = memo(function CatalogEmptyState({
  hasActiveView,
  onClear,
  compact,
  totalInCatalog,
}: {
  hasActiveView: boolean;
  onClear: () => void;
  compact?: boolean;
  /** Total de linhas no catálogo (antes de busca/filtros). */
  totalInCatalog: number;
}) {
  if (compact) {
    const emptyDb = totalInCatalog === 0 && !hasActiveView;
    return (
      <div className="text-muted-foreground text-sm">
        {emptyDb
          ? "Nenhum indicador cadastrado. Use “Adicionar indicador” ou rode o seed."
          : "Nenhum indicador com a seleção atual."}{" "}
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
      <p className="text-foreground/85 font-medium">
        {totalInCatalog === 0 && !hasActiveView
          ? "Nenhum indicador cadastrado."
          : "Nenhum indicador com a seleção atual."}
      </p>
      <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
        {totalInCatalog === 0 && !hasActiveView
          ? "Use “Adicionar indicador” ou o comando de seed para popular o catálogo."
          : "Ajuste a busca, os filtros de coluna ou a ordenação, ou adicione um novo indicador."}
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
CatalogEmptyState.displayName = "CatalogEmptyState";

const IndicatorsCatalogTableBody = memo(function IndicatorsCatalogTableBody({
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
  totalInCatalog,
}: {
  options: IndicatorCatalogColumnOptions;
  filters: IndicatorCatalogColumnFilters;
  setCol: IndicatorsCatalogSetCol;
  anyFilter: boolean;
  clearTableView: () => void;
  tableRows: TeamIndicatorDTO[];
  matchedCount: number;
  hasActiveView: boolean;
  sort: { key: IndicatorCatalogSortKey; dir: SortDir } | null;
  onSort: (k: IndicatorCatalogSortKey, kind: ColumnSortKind) => void;
  onEdit: (r: TeamIndicatorDTO) => void;
  onRequestDelete: (id: string) => void;
  totalInCatalog: number;
}) {
  const filterSummaryLines = useMemo(
    () => buildIndicatorCatalogFilterSummaryLines(options, filters),
    [options, filters],
  );
  const sortSummary = useMemo(() => formatIndicatorCatalogSortSummary(sort), [sort]);

  return (
    <div className="space-y-3">
      <DataTableToolbar
        filteredCount={tableRows.length}
        totalCount={matchedCount}
        entityLabels={["indicador", "indicadores"]}
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
          <Table className="min-w-[1280px] w-full table-fixed">
            <TableHeader>
              <TableRow
                className={cn(
                  "border-b border-border",
                  cardClassName,
                  dataTableHeaderRowClass,
                  hasActiveView && dataTableHeaderRowActiveRingClass,
                )}
              >
                <IndicatorsCatalogTableHeadFilters
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
                  <TableCell colSpan={11} className="py-10 text-center">
                    <CatalogEmptyState
                      hasActiveView={hasActiveView}
                      onClear={clearTableView}
                      compact
                      totalInCatalog={totalInCatalog}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                tableRows.map((row) => (
                  <IndicatorsCatalogTableRow
                    key={row.id}
                    row={row}
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

IndicatorsCatalogTableBody.displayName = "IndicatorsCatalogTableBody";

export default IndicatorsCatalogTableBody;
