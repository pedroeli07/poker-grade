"use client";

import { useMemo, useState, useCallback, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Settings2, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { ColumnFilter } from "@/components/column-filter";
import { distinctOptions } from "@/lib/utils";
import { EditPlayerModal } from "@/components/edit-player-modal";
import type { PlayerDataRowProps, PlayerTableRow, PlayersTableColumnKey } from "@/lib/types";
import type { PlayersTablePayload } from "@/lib/types";
import { getPlayersTableDataAction } from "./actions";
import { playerKeys } from "@/lib/queries/player-query-keys";
import { EMPTY_NICK, POKER_NETWORKS_UI } from "@/lib/constants";
import { usePlayersStore } from "@/lib/stores/use-players-store";

const PlayerDataRow = memo(function PlayerDataRow({
  player,
  canEditPlayers,
  onEdit,
}: PlayerDataRowProps) {
  return (
    <TableRow className="hover:bg-sidebar-accent/50">
      <TableCell className="font-medium max-w-[140px] truncate" title={player.name}>
        {player.name}
      </TableCell>
      <TableCell
        className="max-w-[160px] truncate text-[13px] text-muted-foreground"
        title={player.email || "Sem email"}
      >
        {player.email ? player.email : <span className="italic opacity-50">—</span>}
      </TableCell>
      <TableCell className="max-w-[320px]">
        {player.nicks && player.nicks.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 w-max">
            {player.nicks.map((n) => {
              const net = POKER_NETWORKS_UI.find((x) => x.value === n.network);
              return (
                <div
                  key={n.network + n.nick}
                  title={`${n.network}: ${n.nick}`}
                  className="bg-muted/60 px-2 py-1 rounded flex items-center gap-2 overflow-hidden w-max max-w-[120px]"
                >
                  {net?.icon && (
                    <img src={net.icon} alt={net.label} className="w-4 h-4 rounded-[2px] object-contain shrink-0" />
                  )}
                  <span className="text-xs font-mono text-muted-foreground truncate leading-none">
                    {n.nick}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
      <TableCell className="max-w-[150px] truncate" title={player.playerGroup || "Sem grupo"}>
        {player.playerGroup ? (
          <span className="text-[13px] text-muted-foreground">{player.playerGroup}</span>
        ) : (
          <span className="text-[13px] text-muted-foreground italic opacity-50">—</span>
        )}
      </TableCell>
      <TableCell>
        {player.coachKey !== "__none__" ? (
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
            {player.coachLabel}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs italic">Sem Coach</span>
        )}
      </TableCell>
      <TableCell className="pr-4">
        {player.gradeKey !== "__none__" ? (
          <span className="text-sm font-medium">{player.gradeLabel}</span>
        ) : (
          <span className="text-muted-foreground text-xs">Não atribuída</span>
        )}
      </TableCell>
      <TableCell className="w-[6rem] min-w-[6rem] max-w-[6rem] pr-1.5 text-center">
        {player.abiKey !== "__none__" ? (
          <span className="font-mono text-sm font-semibold tabular-nums">{player.abiLabel}</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
      <TableCell className="w-[5.25rem] min-w-[5.25rem] max-w-[5.25rem] px-1 text-center">
        {player.roiTenDay !== null ? (
          player.roiTenDay < -40 ? (
            <span className="inline-flex flex-col items-center gap-1 text-red-500 text-[13px] font-semibold leading-none tabular-nums">
              <TrendingDown className="h-4 w-4 shrink-0" />
              <span>{player.roiTenDay.toFixed(1)}%</span>
            </span>
          ) : player.roiTenDay < -20 ? (
            <span className="inline-flex flex-col items-center gap-1 text-amber-500 text-[13px] font-semibold leading-none tabular-nums">
              <TrendingDown className="h-4 w-4 shrink-0" />
              <span>{player.roiTenDay.toFixed(1)}%</span>
            </span>
          ) : player.roiTenDay >= 0 ? (
            <span className="inline-flex flex-col items-center gap-1 text-emerald-500 text-[13px] font-semibold leading-none tabular-nums">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span>+{player.roiTenDay.toFixed(1)}%</span>
            </span>
          ) : (
            <span className="inline-flex flex-col items-center gap-1 text-muted-foreground text-[13px] font-semibold leading-none tabular-nums">
              <Minus className="h-4 w-4 shrink-0" />
              <span>{player.roiTenDay.toFixed(1)}%</span>
            </span>
          )
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
      <TableCell className="w-[4.25rem] min-w-[4.25rem] max-w-[4.25rem] px-1 text-center font-mono text-[13px] tabular-nums">
        {player.fpTenDay !== null ? (
          <span className={player.fpTenDay > 8 ? "text-amber-500 font-semibold" : ""}>
            {player.fpTenDay.toFixed(1)}%
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="w-[4.25rem] min-w-[4.25rem] max-w-[4.25rem] px-1 text-center font-mono text-[13px] tabular-nums">
        {player.ftTenDay !== null ? (
          <span className={player.ftTenDay < 8 ? "text-red-500 font-semibold" : ""}>
            {player.ftTenDay.toFixed(1)}%
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {player.status === "ACTIVE" ? (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 glow-success border-emerald-500/20">
            Ativo
          </Badge>
        ) : player.status === "SUSPENDED" ? (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/25">Suspenso</Badge>
        ) : (
          <Badge variant="secondary">Inativo</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex items-center justify-end gap-0.5">
          {canEditPlayers ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Editar jogador"
              onClick={() => onEdit(player)}
            >
              <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" asChild title="Gerenciar perfil">
            <Link href={`/dashboard/players/${player.id}`}>
              <Settings2 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

export const PlayersTableClient = memo(function PlayersTableClient({
  initialPayload,
  canEditPlayers,
}: {
  initialPayload: PlayersTablePayload;
  canEditPlayers: boolean;
}) {
  const { data: payload = initialPayload } = useQuery({
    queryKey: playerKeys.list(),
    queryFn: async () => {
      const r = await getPlayersTableDataAction();
      if (!r.ok) throw new Error(r.error);
      return r.payload;
    },
    initialData: initialPayload,
    staleTime: 30_000,
  });

  const { rows, coaches, grades, allowCoachSelect } = payload;

  const [editRow, setEditRow] = useState<PlayerTableRow | null>(null);
  
  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } = usePlayersStore();

  const options = useMemo(
    () => ({
      name: distinctOptions(rows, (r) => ({ value: r.name, label: r.name })),
      nickname: distinctOptions(rows, (r) => {
        const v = r.nickname ?? EMPTY_NICK;
        return {
          value: v,
          label: r.nickname ? r.nickname : "(sem nickname)",
        };
      }),
      playerGroup: distinctOptions(rows, (r) => {
        const v = r.playerGroup ?? EMPTY_NICK;
        return {
          value: v,
          label: r.playerGroup ? r.playerGroup : "(sem grupo)",
        };
      }),
      coach: distinctOptions(rows, (r) => ({
        value: r.coachKey,
        label: r.coachLabel,
      })),
      grade: distinctOptions(rows, (r) => ({
        value: r.gradeKey,
        label: r.gradeLabel,
      })),
      abi: distinctOptions(rows, (r) => ({
        value: r.abiKey,
        label: r.abiLabel,
      })),
      status: distinctOptions(rows, (r) => ({
        value: r.status,
        label:
          r.status === "ACTIVE"
            ? "Ativo"
            : r.status === "SUSPENDED"
              ? "Suspenso"
              : "Inativo",
      })),
    }),
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filters.name && !filters.name.has(r.name)) return false;
      if (
        filters.nickname &&
        !filters.nickname.has(r.nickname ?? EMPTY_NICK)
      )
        return false;
      if (
        filters.playerGroup &&
        !filters.playerGroup.has(r.playerGroup ?? EMPTY_NICK)
      )
        return false;
      if (filters.coach && !filters.coach.has(r.coachKey)) return false;
      if (filters.grade && !filters.grade.has(r.gradeKey)) return false;
      if (filters.abi && !filters.abi.has(r.abiKey)) return false;
      if (filters.status && !filters.status.has(r.status)) return false;
      return true;
    });
  }, [rows, filters]);

  const setCol = useCallback(
    (col: PlayersTableColumnKey) => (next: Set<string> | null) => {
      setColumnFilter(col, next);
    },
    [setColumnFilter]
  );

  const onEditPlayer = useCallback((p: PlayerTableRow) => setEditRow(p), []);

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
        <Table className="table-fixed w-full">
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
              <TableHead className="w-[160px]">
                E-mail
              </TableHead>
              <TableHead className="w-[320px]">
                Nicks
              </TableHead>
              <TableHead className="w-[150px]">
                <ColumnFilter
                  columnId="playerGroup"
                  label="Grupo Shark"
                  options={options.playerGroup}
                  applied={filters.playerGroup}
                  onApply={setCol("playerGroup")}
                />
              </TableHead>
              <TableHead>
                <ColumnFilter
                  columnId="coach"
                  label="Coach"
                  options={options.coach}
                  applied={filters.coach}
                  onApply={setCol("coach")}
                />
              </TableHead>
              <TableHead className="pr-4">
                <ColumnFilter
                  columnId="grade"
                  label="Grade Principal"
                  options={options.grade}
                  applied={filters.grade}
                  onApply={setCol("grade")}
                />
              </TableHead>
              <TableHead className="w-[6rem] min-w-[6rem] max-w-[6rem] pr-1.5 text-center whitespace-normal align-middle">
                <ColumnFilter
                  columnId="abi"
                  label={
                    <span className="flex flex-col items-center justify-center gap-0 leading-tight">
                      <span>ABI</span>
                      <span>ALVO (USD)</span>
                    </span>
                  }
                  options={options.abi}
                  applied={filters.abi}
                  onApply={setCol("abi")}
                  triggerClassName="flex-col gap-1 justify-center w-full min-w-0 py-1 text-center"
                />
              </TableHead>
              <TableHead className="w-[5.25rem] min-w-[5.25rem] max-w-[5.25rem] px-1 text-center whitespace-normal align-middle text-[13px] font-semibold leading-tight">
                ROI
                <br />
                10d
              </TableHead>
              <TableHead className="w-[4.25rem] min-w-[4.25rem] max-w-[4.25rem] px-1 text-center whitespace-normal align-middle text-[13px] font-semibold leading-tight">
                FP
                <br />
                10d
              </TableHead>
              <TableHead className="w-[4.25rem] min-w-[4.25rem] max-w-[4.25rem] px-1 text-center whitespace-normal align-middle text-[13px] font-semibold leading-tight">
                FT
                <br />
                10d
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
              <TableHead className="w-[90px] text-right text-muted-foreground font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="text-center py-10 text-muted-foreground"
                >
                  Nenhum jogador com os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((player) => (
                <PlayerDataRow
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
