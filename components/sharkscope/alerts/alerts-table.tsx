"use client";

import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AlertsTableRow from "@/components/sharkscope/alerts/alerts-table-row";
import DataTableShell from "@/components/data-table/data-table-shell";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import SortButton from "@/components/sort-button";
import ColumnFilter from "@/components/column-filter";
import NumberRangeFilter from "@/components/number-range-filter";
import { cn } from "@/lib/utils";
import {
  dataTableHeaderRowActiveRingClass,
  dataTableHeaderRowClass,
} from "@/lib/constants";
import type { SharkscopeAlertRow } from "@/lib/types";
import type { AlertSortKey } from "@/hooks/sharkscope/alerts/use-alerts-page-client";
import type { ColumnSortState } from "@/lib/types/dataTable";
import { isFilterActive, type NumberFilterValue } from "@/lib/number-filter";
import {
  ALERT_ACK_FILTER_OPTIONS,
  ALERT_SEVERITY_FILTER_OPTIONS,
  ALERT_TYPE_FILTER_OPTIONS,
} from "@/lib/constants/sharkscope/alerts";

const AlertsTable = memo(function AlertsTable({
  hasActiveView,
  canAcknowledge,
  paginatedRows,
  selectedIds,
  onToggleRowSelect,
  headerChecked,
  onToggleSelectCurrentPage,
  isPending,
  onAcknowledge,
  sort,
  toggleSort,
  filterSeverity,
  filterType,
  filterAck,
  filterPlayer,
  filterValor,
  filterLimite,
  filterData,
  setFilterSeverity,
  setFilterType,
  setFilterAck,
  setFilterPlayer,
  setFilterValor,
  setFilterLimite,
  setFilterData,
  playerOptions,
  dataOptions,
}: {
  hasActiveView: boolean;
  canAcknowledge: boolean;
  paginatedRows: SharkscopeAlertRow[];
  selectedIds: Set<string>;
  onToggleRowSelect: (id: string, selected: boolean) => void;
  headerChecked: boolean | "indeterminate";
  onToggleSelectCurrentPage: (checked: boolean) => void;
  isPending: boolean;
  onAcknowledge: (id: string) => void;
  sort: ColumnSortState<AlertSortKey>;
  toggleSort: (key: AlertSortKey, kind: "string" | "date" | "number") => void;
  filterSeverity: Set<string> | null;
  filterType: Set<string> | null;
  filterAck: Set<string> | null;
  filterPlayer: Set<string> | null;
  filterValor: NumberFilterValue | null;
  filterLimite: NumberFilterValue | null;
  filterData: Set<string> | null;
  setFilterSeverity: (v: Set<string> | null) => void;
  setFilterType: (v: Set<string> | null) => void;
  setFilterAck: (v: Set<string> | null) => void;
  setFilterPlayer: (v: Set<string> | null) => void;
  setFilterValor: (v: NumberFilterValue | null) => void;
  setFilterLimite: (v: NumberFilterValue | null) => void;
  setFilterData: (v: Set<string> | null) => void;
  playerOptions: { value: string; label: string }[];
  dataOptions: { value: string; label: string }[];
}) {
  return (
    <DataTableShell hasActiveView={hasActiveView}>
      <div className="overflow-x-auto">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow
              className={cn(
                dataTableHeaderRowClass,
                hasActiveView && dataTableHeaderRowActiveRingClass
              )}
            >
              {canAcknowledge && (
                <TableHead className="w-11 min-w-11 max-w-11 !px-1.5 align-middle">
                  <div
                    className="mx-auto flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-primary/45 bg-background shadow-sm"
                    title='Marca ou desmarca só os alertas desta página (ajuste "Linhas por página" para incluir todos)'
                  >
                    <Checkbox
                      checked={headerChecked}
                      onCheckedChange={(v) => onToggleSelectCurrentPage(v === true)}
                      disabled={isPending || paginatedRows.length === 0}
                      aria-label="Selecionar todos os alertas desta página"
                      className="size-[15px] shrink-0 border-2 border-foreground/45 bg-background shadow-none hover:border-primary/80 data-[state=checked]:border-primary data-[state=indeterminate]:border-primary"
                    />
                  </div>
                </TableHead>
              )}
              <TableHead>
                <div className="flex items-center justify-center gap-0.5">
                  <SortButton columnKey="severity" sort={sort} toggleSort={toggleSort} kind="string" label="severidade" />
                  <ColumnFilter
                    columnId="severity"
                    ariaLabel="Severidade"
                    label={
                      <FilteredColumnTitle active={filterSeverity !== null}>Severidade</FilteredColumnTitle>
                    }
                    options={ALERT_SEVERITY_FILTER_OPTIONS}
                    applied={filterSeverity}
                    onApply={setFilterSeverity}
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-0.5">
                  <SortButton columnKey="player" sort={sort} toggleSort={toggleSort} kind="string" label="jogador" />
                  <ColumnFilter
                    columnId="player"
                    ariaLabel="Jogador"
                    label={
                      <FilteredColumnTitle active={filterPlayer !== null}>Jogador</FilteredColumnTitle>
                    }
                    options={playerOptions}
                    applied={filterPlayer}
                    onApply={setFilterPlayer}
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-0.5">
                  <SortButton columnKey="alertType" sort={sort} toggleSort={toggleSort} kind="string" label="tipo" />
                  <ColumnFilter
                    columnId="alertType"
                    ariaLabel="Tipo"
                    label={<FilteredColumnTitle active={filterType !== null}>Tipo</FilteredColumnTitle>}
                    options={ALERT_TYPE_FILTER_OPTIONS}
                    applied={filterType}
                    onApply={setFilterType}
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-0.5">
                  <NumberRangeFilter
                    ariaLabel="Valor"
                    label={
                      <FilteredColumnTitle active={isFilterActive(filterValor)}>Valor</FilteredColumnTitle>
                    }
                    value={filterValor}
                    onChange={setFilterValor}
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-0.5">
                  <NumberRangeFilter
                    ariaLabel="Limite"
                    label={
                      <FilteredColumnTitle active={isFilterActive(filterLimite)}>Limite</FilteredColumnTitle>
                    }
                    value={filterLimite}
                    onChange={setFilterLimite}
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-0.5">
                  <SortButton columnKey="triggeredAt" sort={sort} toggleSort={toggleSort} kind="date" label="data" />
                  <ColumnFilter
                    columnId="data"
                    ariaLabel="Data"
                    label={<FilteredColumnTitle active={filterData !== null}>Data</FilteredColumnTitle>}
                    options={dataOptions}
                    applied={filterData}
                    onApply={setFilterData}
                  />
                </div>
              </TableHead>
              {canAcknowledge && (
                <TableHead className="text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-0.5">
                    <ColumnFilter
                      columnId="ack"
                      ariaLabel="Estado"
                      label={<FilteredColumnTitle active={filterAck !== null}>Ação</FilteredColumnTitle>}
                      options={ALERT_ACK_FILTER_OPTIONS}
                      applied={filterAck}
                      onApply={setFilterAck}
                    />
                  </div>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.map((alert) => (
              <AlertsTableRow
                key={alert.id}
                alert={alert}
                canAcknowledge={canAcknowledge}
                isSelected={selectedIds.has(alert.id)}
                isPending={isPending}
                onToggleSelect={onToggleRowSelect}
                onAcknowledge={onAcknowledge}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </DataTableShell>
  );
});

AlertsTable.displayName = "AlertsTable";

export default AlertsTable;
