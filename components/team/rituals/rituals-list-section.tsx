"use client";

import { Search } from "lucide-react";
import { memo, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils/cn";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
import {
  dataTableHeaderRowActiveRingClass,
  dataTableHeaderRowClass,
} from "@/lib/constants/classes";
import DataTableShell from "@/components/data-table/data-table-shell";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import RitualsListToolbar from "@/components/team/rituals/rituals-list-toolbar";
import RitualsListTableHeadFilters from "@/components/team/rituals/rituals-list-table-head-filters";
import RitualsListTableRow from "@/components/team/rituals/rituals-list-table-row";
import { RITUAL_TABLE_HEAD_COLUMNS } from "@/lib/constants/team/rituals-list-columns";
import { useRitualsListTable } from "@/hooks/team/use-rituals-list-table";
import type { RitualDTO } from "@/lib/data/team/rituals-page";
import {
  buildRitualListFilterSummaryLines,
  formatRitualTableSortSummary,
} from "@/lib/utils/team/rituals-list-filters";

const RitualsListEmptyState = memo(function RitualsListEmptyState({
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
        Nenhum ritual com a seleção atual.{" "}
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
      <p className="text-foreground/85 font-medium">Nenhum ritual com a seleção atual.</p>
      <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
        Ajuste a busca, os filtros de coluna ou a ordenação.
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
RitualsListEmptyState.displayName = "RitualsListEmptyState";

export type RitualsListSectionProps = {
  rituals: RitualDTO[];
  onExecute: (r: RitualDTO) => void;
  onEdit: (r: RitualDTO) => void;
  onDelete: (r: RitualDTO) => void;
  onUndo: (r: RitualDTO) => void;
  undoPending: boolean;
};

export const RitualsListSection = memo(function RitualsListSection({
  rituals,
  onExecute,
  onEdit,
  onDelete,
  onUndo,
  undoPending,
}: RitualsListSectionProps) {
  const {
    search,
    setSearch,
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
    anyFilter,
    clearTableView,
    hasActiveView,
    sort,
    onSort,
  } = useRitualsListTable(rituals);

  const filterSummaryLines = useMemo(
    () => buildRitualListFilterSummaryLines(options, filters),
    [options, filters],
  );
  const sortSummary = useMemo(() => formatRitualTableSortSummary(sort), [sort]);

  const tableColSpan = RITUAL_TABLE_HEAD_COLUMNS.length + 1;

  return (
    <div className="w-full space-y-4">
      {!pageSizeHydrated ? (
        <div className="min-h-[240px] rounded-2xl border border-dashed border-border/60 bg-muted/20" aria-busy />
      ) : (
        <>
          <RitualsListToolbar
            matchedCount={matchedCount}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onChangePage={changePage}
            onChangePageSize={changePageSize}
            pageItemCount={paginatedRows.length}
          />

          <div className="space-y-3">
            <DataTableToolbar
              filteredCount={paginatedRows.length}
              totalCount={matchedCount}
              entityLabels={["ritual", "rituais"]}
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
                      <RitualsListTableHeadFilters
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
                        <TableCell colSpan={tableColSpan} className="py-10 text-center">
                          <RitualsListEmptyState
                            hasActiveView={hasActiveView}
                            onClear={clearTableView}
                            compact
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRows.map((r) => (
                        <RitualsListTableRow
                          key={r.id}
                          ritual={r}
                          onExecute={onExecute}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onUndo={onUndo}
                          undoPending={undoPending}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </DataTableShell>
          </div>
        </>
      )}
    </div>
  );
});

RitualsListSection.displayName = "RitualsListSection";
