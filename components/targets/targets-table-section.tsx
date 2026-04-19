"use client";

import { memo, useCallback, useMemo } from "react";
import ColumnFilter from "@/components/column-filter";
import DataTableShell from "@/components/data-table/data-table-shell";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TARGETS_TABLE_HEAD_COLUMNS } from "@/lib/constants/target";
import {
  dataTableHeaderRowActiveRingClass,
  dataTableHeaderRowClass,
} from "@/lib/constants";
import { useTargetsTableSection } from "@/hooks/targets/use-targets-table-section";
import type { ColKey, Filters, TargetListRow, TargetsColumnOptions } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  buildTargetsFilterSummaryLines,
  formatTargetsSortSummary,
} from "@/lib/utils/target";
import TargetTableRow from "@/components/targets/target-table-row";
import SortButton from "@/components/sort-button";

const TargetsTableSection = memo(function TargetsTableSection({
  filtered,
  options,
  filters,
  setCol,
  totalCount,
  anyFilter,
  clearFilters,
}: {
  filtered: TargetListRow[];
  options: TargetsColumnOptions;
  filters: Filters;
  setCol: (col: ColKey) => (next: Set<string> | null) => void;
  totalCount: number;
  anyFilter: boolean;
  clearFilters: () => void;
}) {
  const { sort, toggleSort, resetSort, viewModels } = useTargetsTableSection(filtered);

  const hasActiveView = anyFilter || sort !== null;
  const filterSummaryLines = useMemo(
    () => buildTargetsFilterSummaryLines(filters, options),
    [filters, options]
  );
  const sortSummary = useMemo(() => formatTargetsSortSummary(sort), [sort]);

  const onClear = useCallback(() => {
    clearFilters();
    resetSort();
  }, [clearFilters, resetSort]);

  return (
    <div className="space-y-3">
      <DataTableToolbar
        filteredCount={filtered.length}
        totalCount={totalCount}
        entityLabels={["target", "targets"]}
        hasActiveView={hasActiveView}
        anyFilter={anyFilter}
        sortSummary={sortSummary}
        filterSummaryLines={filterSummaryLines}
        onClear={onClear}
      />
      <DataTableShell hasActiveView={hasActiveView}>
        <div className="relative w-full overflow-x-auto">
          <Table className="min-w-[720px] w-full table-fixed">
            <TableHeader>
              <TableRow
                className={cn(
                  "border-b border-border transition-colors",
                  dataTableHeaderRowClass,
                  hasActiveView && dataTableHeaderRowActiveRingClass
                )}
              >
                {TARGETS_TABLE_HEAD_COLUMNS.map(([w, id, col, label]) => (
                  <TableHead
                    key={id}
                    className={cn(`${w} h-14 align-middle text-center`)}
                  >
                    <div className="flex items-center justify-center gap-0.5 py-1">
                      <SortButton
                        columnKey={col}
                        sort={sort}
                        toggleSort={toggleSort}
                        kind="string"
                        label={label}
                      />
                      <ColumnFilter
                        columnId={id}
                        ariaLabel={label}
                        label={
                          <FilteredColumnTitle active={filters[col] !== null}>
                            {label}
                          </FilteredColumnTitle>
                        }
                        options={options[col] || []}
                        applied={filters[col]}
                        onApply={setCol(col)}
                      />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                    Nenhum target com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                viewModels.map((vm) => <TargetTableRow key={vm.id} vm={vm} />)
              )}
            </TableBody>
          </Table>
        </div>
      </DataTableShell>
    </div>
  );
});

TargetsTableSection.displayName = "TargetsTableSection";

export default TargetsTableSection;
