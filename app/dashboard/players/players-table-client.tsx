"use client";

import { memo, useCallback, useMemo, type ReactNode } from "react";
import { ArrowDownWideNarrow, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isFilterActive } from "@/lib/number-filter";
import { buildPlayersFilterSummaryLines } from "@/lib/utils/players-table-filter-summary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import NumberRangeFilter from "@/components/number-range-filter";
import { EditPlayerModal } from "@/components/edit-player-modal";
import type { PlayersTablePayload } from "@/lib/types";
import { usePlayersTablePage, type PlayersTableSortKey } from "../../../hooks/players/use-players-table-page";
import PlayerTableRow from "@/components/players/player-table-row";
import { TableColumnSortButton } from "@/components/table-column-sort-button";
import { cn } from "@/lib/utils";

const STATS_TABLE_HEAD =
  "w-[8%] min-w-0 px-0.5 align-middle text-center text-[14px] leading-tight";

const SORT_LABELS: Record<PlayersTableSortKey, string> = {
  name: "Nome",
  email: "E-mail",
  nicks: "Nicks",
  playerGroup: "Grupo Shark",
  coachLabel: "Coach",
  gradeLabel: "Grade",
  abiNumericValue: "ABI",
  roiTenDay: "ROI (10d)",
  fpTenDay: "FP (10d)",
  ftTenDay: "FT (10d)",
  status: "Status",
};

/** Título da coluna dentro de badge azul quando o filtro da coluna está ativo. */
function FilteredColumnTitle({ active, children }: { active: boolean; children: ReactNode }) {
  if (!active) return <>{children}</>;
  return (
    <Badge className="max-w-[min(100%,13rem)] animate-pulse truncate border-primary/50 bg-primary/20 px-3 py-1.5 text-xs font-semibold leading-snug text-primary shadow-sm sm:max-w-[16rem] sm:text-sm">
      {children}
    </Badge>
  );
}

const PlayersTableClient = memo(function PlayersTableClient({
  initialPayload,
  canEditPlayers,
}: {
  initialPayload: PlayersTablePayload;
  canEditPlayers: boolean;
}) {
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

  const sortBtn = useCallback(
    (key: PlayersTableSortKey, kind: "number" | "string", label: string) => {
      const active = sort?.key === key;
      return (
        <TableColumnSortButton
          ariaLabel={`Ordenar por ${label}`}
          isActive={active}
          direction={active ? sort!.dir : null}
          onClick={() => toggleSort(key, kind)}
        />
      );
    },
    [sort, toggleSort]
  );

  const hasActiveView = anyFilter || sort !== null;

  const sortSummary = useMemo(() => {
    if (!sort) return null;
    const label = SORT_LABELS[sort.key] ?? sort.key;
    const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
    return `${label} (${dirPt})`;
  }, [sort]);

  const filterSummaryLines = useMemo(
    () => buildPlayersFilterSummaryLines(filters, options, numFilters),
    [filters, options, numFilters]
  );

  return (
    <div className="min-w-0 max-w-full space-y-3">
      <EditPlayerModal
        player={editRow}
        open={editRow !== null}
        onOpenChange={(o) => {
          if (!o) setEditRow(null);
        }}
        coaches={coaches}
        grades={grades}
        allowCoachSelect={allowCoachSelect}
      />
      <div
        className={cn(
          "flex flex-col gap-2 px-4 py-2 text-sm transition-all duration-300",
          hasActiveView
            ? "rounded-xl border border-primary/40 bg-gradient-to-r from-primary/[0.12] via-primary/[0.07] to-transparent shadow-[inset_0_1px_0_0_rgba(59,130,246,0.15)]"
            : "text-muted-foreground"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
            <span className={cn(hasActiveView && "font-medium text-foreground")}>
              Mostrando{" "}
              <span className="font-semibold tabular-nums text-primary">{filtered.length}</span> de{" "}
              <span className="tabular-nums">{rows.length}</span> jogador{rows.length !== 1 ? "es" : ""}
            </span>
            {hasActiveView && (
              <div className="flex flex-wrap items-center gap-2">
                {anyFilter && (
                  <Badge className="gap-1 border-primary/30 bg-primary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary shadow-sm">
                    <Filter className="h-3 w-3" aria-hidden />
                    Filtros ativos
                  </Badge>
                )}
                {sort && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-primary/40 bg-background/80 px-2 py-0.5 text-[11px] font-semibold text-primary shadow-sm"
                  >
                    <ArrowDownWideNarrow className="h-3 w-3" aria-hidden />
                    Ordenação: {sortSummary}
                  </Badge>
                )}
              </div>
            )}
          </div>
          {hasActiveView && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 shrink-0 border-primary/25 bg-background/90 text-xs font-medium text-primary hover:bg-primary/10"
              onClick={clearFilters}
            >
              Limpar filtros e ordenação
            </Button>
          )}
        </div>
        {anyFilter && filterSummaryLines.length > 0 && (
          <div className="border-t border-primary/20 pt-2">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary/90">
              Valores filtrados
            </p>
            <div className="flex flex-wrap gap-2">
              {filterSummaryLines.map((line, i) => (
                <span
                  key={i}
                  className="inline-flex max-w-full break-words rounded-md border border-primary/30 bg-background/85 px-2 py-1 text-[11px] leading-snug text-foreground shadow-sm"
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div
        className={cn(
          "min-w-0 max-w-full overflow-hidden transition-all duration-300",
          hasActiveView
            ? "rounded-xl border-2 border-primary/40 bg-primary/[0.03] shadow-[0_0_0_1px_rgba(59,130,246,0.12),0_16px_48px_-16px_rgba(37,99,235,0.18)]"
            : "border-y border-border"
        )}
      >
        <Table className="table-fixed w-full max-w-full">
          <TableHeader>
            <TableRow
              className={cn(
                "bg-blue-500/20 hover:bg-blue-500/20 transition-colors",
                hasActiveView && "bg-primary/20 ring-1 ring-inset ring-primary/15"
              )}
            >
              <TableHead className="w-[9%] min-w-0 text-center">
                <div className="flex items-center justify-center gap-0.5">
                  {sortBtn("name", "string", "nome")}
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
              {/*}
              <TableHead className="w-[8%] min-w-0">
                <div className="flex items-center gap-0.5">
                  {sortBtn("email", "string", "e-mail")}
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
              <TableHead className="w-[22%] min-w-0 text-center">
                <div className="flex items-center justify-center gap-0.5">
                  {sortBtn("nicks", "string", "nicks")}
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
              <TableHead className="w-[12%] min-w-0 text-center">
                <div className="flex items-center justify-center gap-0.5 ">
                  {sortBtn("playerGroup", "string", "grupo Shark")}
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
              <TableHead className="w-[5%] min-w-0 px-1.5 text-center">
                <div className="flex items-center justify-center gap-0.5">
                  {sortBtn("status", "string", "status")}
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
              <TableHead className="w-[8%] min-w-0 text-center">
                <div className="flex items-center justify-center gap-0.5">
                  {sortBtn("coachLabel", "string", "coach")}
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
              <TableHead className="w-[8%] min-w-0 text-center">
                <div className="flex items-center justify-center gap-0.5">
                  {sortBtn("gradeLabel", "string", "grade")}
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
              <TableHead className="w-[6%] min-w-0 pr-1 align-middle text-center">
                <div className="flex items-center justify-center gap-0.5">
                  {sortBtn("abiNumericValue", "number", "ABI")}
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
              <TableHead className={STATS_TABLE_HEAD}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center justify-center gap-0.5">
                    {sortBtn("roiTenDay", "number", "ROI 10d")}
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
              <TableHead className={STATS_TABLE_HEAD}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center justify-center gap-0.5">
                    {sortBtn("fpTenDay", "number", "FP 10d")}
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
              <TableHead className={STATS_TABLE_HEAD}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center justify-center gap-0.5">
                    {sortBtn("ftTenDay", "number", "FT 10d")}
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
              <TableHead className="w-[3%] min-w-0 px-1.5 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
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
      </div>
    </div>
  );
});

PlayersTableClient.displayName = "PlayersTableClient";

export default PlayersTableClient;
