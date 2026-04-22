"use client";

import { memo, useMemo } from "react";
import { isFilterActive } from "@/lib/number-filter";
import { buildPlayersFilterSummaryLines, formatPlayersTableSortSummary } from "@/lib/utils/player";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import NumberRangeFilter from "@/components/number-range-filter";
import DataTableShell from "@/components/data-table/data-table-shell";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import { usePlayersTablePage } from "@/hooks/players/use-players-table-page";
import PlayerTableRow from "@/components/players/player-table-row";
import { cn } from "@/lib/utils/cn";
import { playersTableCol, playersTableStatsHeadClass, dataTableHeaderRowActiveRingClass, dataTableHeaderRowClass } from "@/lib/constants/classes";
import SortButton from "@/components/sort-button";
import type { PlayersTableClientProps } from "@/lib/types/player";
import EditPlayerModal from "@/components/modals/edit-player-modal";

const PlayersTableClient = memo(function PlayersTableClient({
  initialPayload,
  canEditPlayers,
}: PlayersTableClientProps) {
  const {
    rows,
    coaches,
    grades,
    allowCoachSelect,
    editRow,
    setEditRow,
    filters,
    options,
    filtered,
    anyFilter,
    clearFilters,
    setCol,
    numFilters,
    setNumFilter,
    toggleSort,
    sort,
    uniqueRoiTenDay,
    uniqueFpTenDay,
    uniqueFtTenDay,
    onEditPlayer,
  } = usePlayersTablePage(initialPayload);

  const hasActiveView = anyFilter || sort !== null;

  const sortSummary = useMemo(() => formatPlayersTableSortSummary(sort), [sort]);

  const filterSummaryLines = useMemo(
    () => buildPlayersFilterSummaryLines(filters, options, numFilters),
    [filters, options, numFilters]
  );

  return (
    <div className="min-w-0 max-w-full space-y-3">
      <EditPlayerModal
        player={editRow}
        open={editRow !== null}
        onOpenChange={(o: boolean) => {
          if (!o) setEditRow(null);
        }}
        coaches={coaches}
        grades={grades}
        allowCoachSelect={allowCoachSelect}
      />
      <DataTableToolbar
        filteredCount={filtered.length}
        totalCount={rows.length}
        entityLabels={["jogador", "jogadores"]}
        hasActiveView={hasActiveView}
        anyFilter={anyFilter}
        sortSummary={sortSummary}
        filterSummaryLines={filterSummaryLines}
        onClear={clearFilters}
      />
      <DataTableShell hasActiveView={hasActiveView}>
        <Table className="table-fixed w-full max-w-full">
          <TableHeader>
            <TableRow
              className={cn(
                dataTableHeaderRowClass,
                hasActiveView && dataTableHeaderRowActiveRingClass
              )}
            >
              <TableHead className={cn(playersTableCol.name, "text-center")}>
                <div className="flex items-center justify-center gap-0.5">
                  <SortButton columnKey="name" sort={sort} toggleSort={toggleSort} kind="string" label="nome" />
                  <ColumnFilter
                    columnId="name"
                    ariaLabel="Nome"
                    label={<FilteredColumnTitle active={filters.name !== null}>Nome</FilteredColumnTitle>}
                    options={options.name}
                    applied={filters.name}
                    onApply={setCol("name")}
                  />
                </div>
              </TableHead>
              {/*
              <TableHead className="w-[8%] min-w-0">
                <div className="flex items-center gap-0.5">
                  <SortButton columnKey="email" sort={sort} toggleSort={toggleSort} kind="string" label="e-mail" />
                  <ColumnFilter
                    columnId="email"
                    label="E-mail"
                    options={options.email}
                    applied={filters.email}
                    onApply={setCol("email")}
                  />
                </div>
              </TableHead>
              */}
              <TableHead className={cn(playersTableCol.nicks, "text-center")}>
                <div className="flex items-center justify-center gap-0.5">
                  <SortButton columnKey="nicks" sort={sort} toggleSort={toggleSort} kind="string" label="nicks" />
                  <ColumnFilter
                    columnId="nicks"
                    ariaLabel="Nicks"
                    label={<FilteredColumnTitle active={filters.nicks !== null}>Nicks</FilteredColumnTitle>}
                    options={options.nicks}
                    applied={filters.nicks}
                    onApply={setCol("nicks")}
                  />
                </div>
              </TableHead>
              <TableHead className={cn(playersTableCol.grupoShark, "text-center")}>
                <div className="flex items-center justify-center gap-0.5 ">
                  <SortButton columnKey="playerGroup" sort={sort} toggleSort={toggleSort} kind="string" label="grupo Shark" />
                  <ColumnFilter
                    columnId="playerGroup"
                    ariaLabel="Grupo Shark"
                    label={
                      <FilteredColumnTitle active={filters.playerGroup !== null}>Grupo Shark</FilteredColumnTitle>
                    }
                    options={options.playerGroup}
                    applied={filters.playerGroup}
                    onApply={setCol("playerGroup")}
                  />
                </div>
              </TableHead>
              <TableHead className={cn(playersTableCol.status, "text-center")}>
                <div className="flex items-center justify-center gap-0.5">
                  <SortButton columnKey="status" sort={sort} toggleSort={toggleSort} kind="string" label="status" />
                  <ColumnFilter
                    columnId="status"
                    ariaLabel="Status"
                    label={<FilteredColumnTitle active={filters.status !== null}>Status</FilteredColumnTitle>}
                    options={options.status}
                    applied={filters.status}
                    onApply={setCol("status")}
                  />
                </div>
              </TableHead>
              <TableHead className={cn(playersTableCol.coach, "text-center")}>
                <div className="flex items-center justify-center gap-0.5">
                  <SortButton columnKey="coachLabel" sort={sort} toggleSort={toggleSort} kind="string" label="coach" />
                  <ColumnFilter
                    columnId="coach"
                    ariaLabel="Coach"
                    label={<FilteredColumnTitle active={filters.coach !== null}>Coach</FilteredColumnTitle>}
                    options={options.coach}
                    applied={filters.coach}
                    onApply={setCol("coach")}
                  />
                </div>
              </TableHead>
              <TableHead className={cn(playersTableCol.grade, "text-center")}>
                <div className="flex items-center justify-center gap-0.5">
                  <SortButton columnKey="gradeLabel" sort={sort} toggleSort={toggleSort} kind="string" label="grade" />
                  <ColumnFilter
                    columnId="grade"
                    ariaLabel="Grade"
                    label={<FilteredColumnTitle active={filters.grade !== null}>Grade</FilteredColumnTitle>}
                    options={options.grade}
                    applied={filters.grade}
                    onApply={setCol("grade")}
                  />
                </div>
              </TableHead>
              <TableHead className={cn(playersTableCol.abi, "pr-1 align-middle text-center")}>
                <div className="flex items-center justify-center gap-0.5">
                  <SortButton columnKey="abiNumericValue" sort={sort} toggleSort={toggleSort} kind="number" label="ABI" />
                  <ColumnFilter
                    columnId="abi"
                    ariaLabel="ABI"
                    label={<FilteredColumnTitle active={filters.abi !== null}>ABI</FilteredColumnTitle>}
                    options={options.abi}
                    applied={filters.abi}
                    onApply={setCol("abi")}
                  />
                </div>
              </TableHead>
              <TableHead className={playersTableStatsHeadClass}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center justify-center gap-0.5">
                    <SortButton columnKey="roiTenDay" sort={sort} toggleSort={toggleSort} kind="number" label="ROI 10d" />
                    <NumberRangeFilter
                      ariaLabel="ROI (10d)"
                      label={
                        <FilteredColumnTitle active={isFilterActive(numFilters.roiTenDay ?? null)}>
                          ROI (10d)
                        </FilteredColumnTitle>
                      }
                      value={numFilters.roiTenDay ?? null}
                      onChange={setNumFilter("roiTenDay")}
                      suffix="%"
                      uniqueValues={uniqueRoiTenDay}
                    />
                  </div>
                </div>
              </TableHead>
              <TableHead className={playersTableStatsHeadClass}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center justify-center gap-0.5">
                    <SortButton columnKey="fpTenDay" sort={sort} toggleSort={toggleSort} kind="number" label="FP 10d" />
                    <NumberRangeFilter
                      ariaLabel="FP (10d)"
                      label={
                        <FilteredColumnTitle active={isFilterActive(numFilters.fpTenDay ?? null)}>
                          FP (10d)
                        </FilteredColumnTitle>
                      }
                      value={numFilters.fpTenDay ?? null}
                      onChange={setNumFilter("fpTenDay")}
                      suffix="%"
                      uniqueValues={uniqueFpTenDay}
                    />
                  </div>
                </div>
              </TableHead>
              <TableHead className={playersTableStatsHeadClass}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center justify-center gap-0.5">
                    <SortButton columnKey="ftTenDay" sort={sort} toggleSort={toggleSort} kind="number" label="FT 10d" />
                    <NumberRangeFilter
                      ariaLabel="FT (10d)"
                      label={
                        <FilteredColumnTitle active={isFilterActive(numFilters.ftTenDay ?? null)}>
                          FT (10d)
                        </FilteredColumnTitle>
                      }
                      value={numFilters.ftTenDay ?? null}
                      onChange={setNumFilter("ftTenDay")}
                      suffix="%"
                      uniqueValues={uniqueFtTenDay}
                    />
                  </div>
                </div>
              </TableHead>
              <TableHead className={cn(playersTableCol.actions, "text-right")}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                  Nenhum jogador encontrado com os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((player) => (
                <PlayerTableRow
                  key={player.id}
                  player={player}
                  canEditPlayers={canEditPlayers}
                  onEdit={onEditPlayer}
                />
              ))
            )}
          </TableBody>
        </Table>
      </DataTableShell>
    </div>
  );
});

PlayersTableClient.displayName = "PlayersTableClient";

export default PlayersTableClient;
