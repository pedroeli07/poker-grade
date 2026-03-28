"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Archive, LayoutGrid, Table2, Users } from "lucide-react";
import { cardClassName } from "@/lib/constants";
import { DeleteGradeButton } from "@/components/delete-grade-button";
import { ColumnFilter } from "@/components/column-filter";
import { distinctOptions } from "@/lib/distinct-options";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export type GradeListRow = {
  id: string;
  name: string;
  description: string | null;
  rulesCount: number;
  assignmentsCount: number;
  assignedPlayers: { id: string; name: string }[];
};

const playersHoverScrollClass =
  "max-h-[min(320px,50vh)] overflow-y-auto overflow-x-hidden space-y-0.5 pr-1 " +
  "[scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--muted-foreground)_45%,transparent)_color-mix(in_oklab,var(--muted)_80%,transparent)] " +
  "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/35";

function GradePlayersHover({
  count,
  players,
  gradeName,
  variant = "card",
}: {
  count: number;
  players: { id: string; name: string }[];
  gradeName: string;
  variant?: "card" | "table";
}) {
  const badgeClass =
    variant === "card"
      ? "bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5"
      : "bg-primary/10 text-primary border-primary/20 text-xs tabular-nums";

  const trigger = (
    <button
      type="button"
      className={cn(
        "cursor-help rounded-md border-0 bg-transparent p-0 text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variant === "table" && "inline-flex"
      )}
      aria-label={`${count} jogador${count !== 1 ? "es" : ""} — passar o mouse para ver a lista`}
    >
      <Badge variant="secondary" className={badgeClass}>
        {variant === "card" ? `${count} Jogadores` : count}
      </Badge>
    </button>
  );

  return (
    <HoverCard openDelay={220} closeDelay={120}>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="center"
        sideOffset={8}
        collisionPadding={12}
        className={cn(
          "z-[90] w-[min(92vw,22rem)] p-0 bg-blue-500/10 backdrop-blur-md border border-blue-500/20 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.3)]",
          "[scrollbar-width:thin]"
        )}
      >
        <div className="border-b border-border px-3 py-2 flex items-center gap-2 bg-muted/30">
          <Users className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              Jogadores na grade
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {gradeName}
            </p>
          </div>
        </div>
        <div className="p-3">
          {players.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum jogador com assignment ativo nesta grade.
            </p>
          ) : (
            <ul className={playersHoverScrollClass}>
              {players.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/dashboard/players/${p.id}`}
                    className="block rounded-md px-2 py-1.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

type ColumnKey = "name" | "description" | "rules" | "players";
type ColumnFilters = Record<ColumnKey, Set<string> | null>;

const EMPTY_DESC = "__empty__";

function descriptionPick(r: GradeListRow) {
  const raw = r.description?.trim() ?? "";
  const value = raw || EMPTY_DESC;
  const label = raw
    ? raw.length > 80
      ? `${raw.slice(0, 80)}…`
      : raw
    : "(sem descrição)";
  return { value, label };
}

export function GradesPageClient({
  rows,
  manage,
}: {
  rows: GradeListRow[];
  manage: boolean;
}) {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [filters, setFilters] = useState<ColumnFilters>({
    name: null,
    description: null,
    rules: null,
    players: null,
  });

  const options = useMemo(
    () => ({
      name: distinctOptions(rows, (r) => ({ value: r.name, label: r.name })),
      description: distinctOptions(rows, (r) => descriptionPick(r)),
      rules: distinctOptions(rows, (r) => ({
        value: String(r.rulesCount),
        label: `${r.rulesCount} regra${r.rulesCount !== 1 ? "s" : ""}`,
      })),
      players: distinctOptions(rows, (r) => ({
        value: String(r.assignmentsCount),
        label: `${r.assignmentsCount} jogador${r.assignmentsCount !== 1 ? "es" : ""}`,
      })),
    }),
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filters.name && !filters.name.has(r.name)) return false;
      const raw = r.description?.trim() ?? "";
      const descVal = raw || EMPTY_DESC;
      if (filters.description && !filters.description.has(descVal))
        return false;
      if (filters.rules && !filters.rules.has(String(r.rulesCount)))
        return false;
      if (
        filters.players &&
        !filters.players.has(String(r.assignmentsCount))
      )
        return false;
      return true;
    });
  }, [rows, filters]);

  const setCol = (col: ColumnKey) => (next: Set<string> | null) => {
    setFilters((f) => ({ ...f, [col]: next }));
  };

  const anyFilter =
    filters.name !== null ||
    filters.description !== null ||
    filters.rules !== null ||
    filters.players !== null;

  const descriptionCell = (r: GradeListRow) =>
    r.description?.trim() ? (
      <span className="text-sm line-clamp-2 max-w-md">{r.description}</span>
    ) : (
      <span className="text-muted-foreground text-xs italic">
        Sem descrição
      </span>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-lg border border-border p-1 bg-muted/40"
          role="group"
          aria-label="Modo de visualização"
        >
          <Button
            type="button"
            variant={view === "cards" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => setView("cards")}
          >
            <LayoutGrid className="h-4 w-4" />
            Cards
          </Button>
          <Button
            type="button"
            variant={view === "table" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => setView("table")}
          >
            <Table2 className="h-4 w-4" />
            Tabela
          </Button>
        </div>
        {view === "table" && (
          <span className="text-sm text-muted-foreground">
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {filtered.length}
            </span>{" "}
            de{" "}
            <span className="font-medium text-foreground">{rows.length}</span>
          </span>
        )}
      </div>

      {view === "cards" && anyFilter && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            Filtros de coluna ativos ({filtered.length} de {rows.length}{" "}
            grades). Ajuste na visão <strong className="text-foreground">Tabela</strong>.
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs shrink-0"
            onClick={() =>
              setFilters({
                name: null,
                description: null,
                rules: null,
                players: null,
              })
            }
          >
            Limpar filtros
          </Button>
        </div>
      )}

      {view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((grade) => (
            <Card key={grade.id} className={cardClassName}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-xl line-clamp-1">
                    {grade.name}
                  </CardTitle>
                  {manage ? (
                    <DeleteGradeButton
                      gradeId={grade.id}
                      gradeName={grade.name}
                    />
                  ) : null}
                </div>
                <CardDescription className="line-clamp-2 min-h-[44px] text-sm mt-1.5">
                  {grade.description || "Sem descrição"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-5 text-[15px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      {grade.rulesCount}
                    </span>{" "}
                    Regras
                  </div>
                  <div className="flex items-center gap-2">
                    <GradePlayersHover
                      count={grade.assignmentsCount}
                      players={grade.assignedPlayers}
                      gradeName={grade.name}
                      variant="card"
                    />
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-border flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-[14px]"
                  >
                    <Link href={`/dashboard/grades/${grade.id}`}>
                      Ver Regras
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-border rounded-lg text-muted-foreground">
              <Archive className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <p>Nenhuma grade neste filtro.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {anyFilter && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() =>
                  setFilters({
                    name: null,
                    description: null,
                    rules: null,
                    players: null,
                  })
                }
              >
                Limpar todos os filtros
              </Button>
            </div>
          )}
          <div className="rounded-md border border-border overflow-x-auto bg-[oklch(1_0_0/80%)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-500/10 hover:bg-transparent">
                  <TableHead>
                    <ColumnFilter
                      columnId="g-name"
                      label="Nome"
                      options={options.name}
                      applied={filters.name}
                      onApply={setCol("name")}
                    />
                  </TableHead>
                  <TableHead>
                    <ColumnFilter
                      columnId="g-desc"
                      label="Descrição"
                      options={options.description}
                      applied={filters.description}
                      onApply={setCol("description")}
                    />
                  </TableHead>
                  <TableHead>
                    <ColumnFilter
                      columnId="g-rules"
                      label="Regras"
                      options={options.rules}
                      applied={filters.rules}
                      onApply={setCol("rules")}
                    />
                  </TableHead>
                  <TableHead>
                    <ColumnFilter
                      columnId="g-players"
                      label="Jogadores"
                      options={options.players}
                      applied={filters.players}
                      onApply={setCol("players")}
                    />
                  </TableHead>
                  <TableHead className="text-right w-[140px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Nenhuma grade com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((grade) => (
                    <TableRow
                      key={grade.id}
                      className="group hover:bg-sidebar-accent/50"
                    >
                      <TableCell className="font-medium">{grade.name}</TableCell>
                      <TableCell>{descriptionCell(grade)}</TableCell>
                      <TableCell>
                        <span className="tabular-nums font-medium">
                          {grade.rulesCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <GradePlayersHover
                          count={grade.assignmentsCount}
                          players={grade.assignedPlayers}
                          gradeName={grade.name}
                          variant="table"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/grades/${grade.id}`}>
                              Ver regras
                            </Link>
                          </Button>
                          {manage ? (
                            <DeleteGradeButton
                              gradeId={grade.id}
                              gradeName={grade.name}
                              className="opacity-100"
                            />
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
