"use client";

import { useMemo, useState } from "react";
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
import { Settings2 } from "lucide-react";
import type { PlayerStatus } from "@prisma/client";
import { ColumnFilter } from "@/components/column-filter";
import { distinctOptions } from "@/lib/distinct-options";

export type PlayerTableRow = {
  id: string;
  name: string;
  nickname: string | null;
  coachKey: string;
  coachLabel: string;
  gradeKey: string;
  gradeLabel: string;
  status: PlayerStatus;
};

type ColumnKey = "name" | "nickname" | "coach" | "grade" | "status";

type ColumnFilters = Record<ColumnKey, Set<string> | null>;

const EMPTY_NICK = "__empty__";

export function PlayersTableClient({ rows }: { rows: PlayerTableRow[] }) {
  const [filters, setFilters] = useState<ColumnFilters>({
    name: null,
    nickname: null,
    coach: null,
    grade: null,
    status: null,
  });

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
      coach: distinctOptions(rows, (r) => ({
        value: r.coachKey,
        label: r.coachLabel,
      })),
      grade: distinctOptions(rows, (r) => ({
        value: r.gradeKey,
        label: r.gradeLabel,
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
      if (filters.coach && !filters.coach.has(r.coachKey)) return false;
      if (filters.grade && !filters.grade.has(r.gradeKey)) return false;
      if (filters.status && !filters.status.has(r.status)) return false;
      return true;
    });
  }, [rows, filters]);

  const setCol = (col: ColumnKey) => (next: Set<string> | null) => {
    setFilters((f) => ({ ...f, [col]: next }));
  };

  const anyFilter =
    filters.name !== null ||
    filters.nickname !== null ||
    filters.coach !== null ||
    filters.grade !== null ||
    filters.status !== null;

  return (
    <div className="space-y-3">
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
            onClick={() =>
              setFilters({
                name: null,
                nickname: null,
                coach: null,
                grade: null,
                status: null,
              })
            }
          >
            Limpar todos os filtros
          </Button>
        )}
      </div>
      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-500/10 hover:bg-transparent">
              <TableHead>
                <ColumnFilter
                  columnId="name"
                  label="Nome"
                  options={options.name}
                  applied={filters.name}
                  onApply={setCol("name")}
                />
              </TableHead>
              <TableHead>
                <ColumnFilter
                  columnId="nickname"
                  label="Nickname"
                  options={options.nickname}
                  applied={filters.nickname}
                  onApply={setCol("nickname")}
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
              <TableHead>
                <ColumnFilter
                  columnId="grade"
                  label="Grade Principal"
                  options={options.grade}
                  applied={filters.grade}
                  onApply={setCol("grade")}
                />
              </TableHead>
              <TableHead>
                <ColumnFilter
                  columnId="status"
                  label="Status"
                  options={options.status}
                  applied={filters.status}
                  onApply={setCol("status")}
                />
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Nenhum jogador com os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((player) => (
                <TableRow
                  key={player.id}
                  className="hover:bg-sidebar-accent/50"
                >
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.nickname || "-"}</TableCell>
                  <TableCell>
                    {player.coachKey !== "__none__" ? (
                      <Badge
                        variant="outline"
                        className="text-primary border-primary/20 bg-primary/5"
                      >
                        {player.coachLabel}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">
                        Sem Coach
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {player.gradeKey !== "__none__" ? (
                      <span className="text-sm font-medium">
                        {player.gradeLabel}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Não atribuída
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {player.status === "ACTIVE" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 glow-success border-emerald-500/20">
                        Ativo
                      </Badge>
                    ) : player.status === "SUSPENDED" ? (
                      <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/25">
                        Suspenso
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      title="Gerenciar Perfil"
                    >
                      <Link href={`/dashboard/players/${player.id}`}>
                        <Settings2 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
