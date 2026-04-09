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
import { ColumnFilter } from "@/components/column-filter";
import { EditPlayerModal } from "@/components/edit-player-modal";
import type { PlayersTablePayload } from "@/lib/types";
import { usePlayersTablePage } from "../../../hooks/players/use-players-table-page";
import { PlayerTableRow } from "@/components/players/player-table-row";

export const PlayersTableClient = memo(function PlayersTableClient({
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
    <div className="space-y-3">
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
      <div className="rounded-md border border-border overflow-x-auto">
        <Table className="table-fixed w-full min-w-[1280px]">
          <TableHeader>
            <TableRow className="bg-blue-500/10 hover:bg-transparent">
              <TableHead className="w-[140px]">
                <ColumnFilter
                  columnId="name"
                  label="Nome"
                  options={options.name}
                  applied={filters.name}
                  onApply={setCol("name")}
                />
              </TableHead>
              <TableHead className="w-[160px]">E-mail</TableHead>
              <TableHead className="w-[320px]">Nicks</TableHead>
              <TableHead className="w-[150px]">
                <ColumnFilter
                  columnId="playerGroup"
                  label="Grupo Shark"
                  options={options.playerGroup}
                  applied={filters.playerGroup}
                  onApply={setCol("playerGroup")}
                />
              </TableHead>
              <TableHead className="w-[140px]">
                <ColumnFilter
                  columnId="coach"
                  label="Coach"
                  options={options.coach}
                  applied={filters.coach}
                  onApply={setCol("coach")}
                />
              </TableHead>
              <TableHead className="w-[140px] pr-4">
                <ColumnFilter
                  columnId="grade"
                  label="Grade"
                  options={options.grade}
                  applied={filters.grade}
                  onApply={setCol("grade")}
                />
              </TableHead>
              <TableHead className="w-[6rem] pr-1.5 align-middle text-center">
                <ColumnFilter
                  columnId="abi"
                  label="ABI"
                  options={options.abi}
                  applied={filters.abi}
                  onApply={setCol("abi")}
                />
              </TableHead>
              <TableHead className="w-[5.25rem] px-1 align-middle text-center">
                ROI (10d)
              </TableHead>
              <TableHead className="w-[4.25rem] px-1 align-middle text-center">
                FP (10d)
              </TableHead>
              <TableHead className="w-[4.25rem] px-1 align-middle text-center">
                FT (10d)
              </TableHead>
              <TableHead className="w-[120px]">
                <ColumnFilter
                  columnId="status"
                  label="Status"
                  options={options.status}
                  applied={filters.status}
                  onApply={setCol("status")}
                />
              </TableHead>
              <TableHead className="w-[80px] text-right">Ações</TableHead>
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
