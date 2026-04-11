"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import { EditPlayerModal } from "@/components/edit-player-modal";
import type { PlayersTablePayload } from "@/lib/types";
import { usePlayersTablePage } from "../../../hooks/players/use-players-table-page";
import PlayerTableRow from "@/components/players/player-table-row";

const STATS_TABLE_HEAD="w-[5%] min-w-0 px-0.5 align-middle text-center text-[14px] leading-tight"

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
    onEditPlayer,
  } = usePlayersTablePage(initialPayload);

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
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          Mostrando{" "}
          <span className="font-medium text-foreground">{filtered.length}</span>{" "}
          de{" "}
          <span className="font-medium text-foreground">{rows.length}</span>{" "}
          jogador{rows.length !== 1 ? "es" : ""}
        </span>
        {anyFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={clearFilters}
          >
            Limpar todos os filtros
          </Button>
        )}
      </div>
      <div className="min-w-0 max-w-full rounded-md border border-border">
        <Table className="table-fixed w-full max-w-full">
          <TableHeader>
            <TableRow className="bg-blue-500/20 hover:bg-blue-500/20">
              <TableHead className="w-[11%] min-w-0">
                <ColumnFilter
                  columnId="name"
                  label="Nome"
                  options={options.name}
                  applied={filters.name}
                  onApply={setCol("name")}
                />
              </TableHead>
              <TableHead className="w-[10%] min-w-0">E-mail</TableHead>
              <TableHead className="w-[18%] min-w-0">Nicks</TableHead>
              <TableHead className="w-[12%] min-w-0">
                <ColumnFilter
                  columnId="playerGroup"
                  label="Grupo Shark"
                  options={options.playerGroup}
                  applied={filters.playerGroup}
                  onApply={setCol("playerGroup")}
                />
              </TableHead>
              <TableHead className="w-[5%] min-w-0 px-1.5 text-right">
                <ColumnFilter
                  columnId="status"
                  label="Status"
                  options={options.status}
                  applied={filters.status}
                  onApply={setCol("status")}
                />
              </TableHead>
              <TableHead className="w-[9%] min-w-0">
                <ColumnFilter
                  columnId="coach"
                  label="Coach"
                  options={options.coach}
                  applied={filters.coach}
                  onApply={setCol("coach")}
                />
              </TableHead>
              <TableHead className="w-[9%] min-w-0 pr-2">
                <ColumnFilter
                  columnId="grade"
                  label="Grade"
                  options={options.grade}
                  applied={filters.grade}
                  onApply={setCol("grade")}
                />
              </TableHead>
              <TableHead className="w-[6%] min-w-0 pr-1 align-middle text-center">
                <ColumnFilter
                  columnId="abi"
                  label="ABI"
                  options={options.abi}
                  applied={filters.abi}
                  onApply={setCol("abi")}
                />
              </TableHead>
              <TableHead className={STATS_TABLE_HEAD}>
                ROI (10d)
              </TableHead>
              <TableHead className={STATS_TABLE_HEAD}>
                FP (10d)
              </TableHead>
              <TableHead className={STATS_TABLE_HEAD}>
                FT (10d)
              </TableHead>
              <TableHead className="w-[5%] min-w-0 px-1.5 text-right">Ações</TableHead>
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
