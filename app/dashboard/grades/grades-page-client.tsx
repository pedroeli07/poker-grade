"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { DeleteGradeButton } from "@/components/delete-grade-button";
import { EditGradeDialog } from "@/components/edit-grade-dialog";
import { ColumnFilter } from "@/components/column-filter";
import { cn, descriptionPick, distinctOptions } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cardClassName, EMPTY_DESC, playersHoverScrollClass, STALE_TIME } from "@/lib/constants";
import type { GradeListRow, ColumnKey } from "@/lib/types";
import { getGradesListRowsAction } from "@/app/dashboard/grades/actions";
import { gradeKeys } from "@/lib/queries/grade-query-keys";
import { useGradesListStore } from "@/lib/stores/use-grades-list-store";


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
      ? "border-primary/20 bg-primary/[0.06] text-primary text-xs font-medium px-2 py-0.5"
      : "border-primary/20 bg-primary/[0.06] text-primary text-xs tabular-nums font-medium";

  const trigger = (
    <button
      type="button"
      className={cn(
        "cursor-help rounded-md border-0 bg-transparent p-0 text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
        variant === "table" && "inline-flex"
      )}
      aria-label={`${count} jogador${count !== 1 ? "es" : ""} — passar o mouse para ver a lista`}
    >
      <Badge variant="outline" className={badgeClass}>
        {variant === "card" ? `${count} jogadores` : count}
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
        className="z-90 w-[min(92vw,22rem)] p-0 border border-border bg-popover shadow-lg"
      >
        <div className="border-b border-border px-3 py-2 flex items-center gap-2 bg-muted/40">
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
                    className="block rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-primary/8 transition-colors"
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


export default function GradesPageClient({
  rows: initialRows,
  manage,
}: {
  rows: GradeListRow[];
  manage: boolean;
}) {
  const { data: rows = initialRows } = useQuery({
    queryKey: gradeKeys.list(),
    queryFn: async () => {
      const r = await getGradesListRowsAction();
      if (!r.ok) throw new Error(r.error);
      return r.rows;
    },
    initialData: initialRows,
    staleTime: STALE_TIME,
  });

  const [view, setView] = useState<"cards" | "table">("cards");
  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } =
    useGradesListStore();

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

  const setCol = useCallback(
    (col: ColumnKey) => (next: Set<string> | null) => {
      setColumnFilter(col, next);
    },
    [setColumnFilter]
  );

  const descriptionCell = (r: GradeListRow) =>
    r.description?.trim() ? (
      <span className="text-sm text-foreground/90 line-clamp-2 max-w-xl">
        {r.description}
      </span>
    ) : (
      <span className="text-muted-foreground text-sm">—</span>
    );

  const filterControls = (compact: boolean) => (
    <>
      <ColumnFilter
        columnId="g-name"
        label="Nome"
        options={options.name}
        applied={filters.name}
        onApply={setCol("name")}
        compact={compact}
      />
      <ColumnFilter
        columnId="g-desc"
        label="Descrição"
        options={options.description}
        applied={filters.description}
        onApply={setCol("description")}
        compact={compact}
      />
      <ColumnFilter
        columnId="g-rules"
        label="Regras"
        options={options.rules}
        applied={filters.rules}
        onApply={setCol("rules")}
        compact={compact}
      />
      <ColumnFilter
        columnId="g-players"
        label="Jogadores"
        options={options.players}
        applied={filters.players}
        onApply={setCol("players")}
        compact={compact}
      />
    </>
  );

  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div
          className="inline-flex shrink-0 rounded-lg border border-border p-0.5 bg-muted/30"
          role="group"
          aria-label="Modo de visualização"
        >
          <Button
            type="button"
            variant={view === "cards" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "gap-2 h-8 text-xs",
              view === "cards" && "bg-primary/12 text-primary shadow-none"
            )}
            onClick={() => setView("cards")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Cards
          </Button>
          <Button
            type="button"
            variant={view === "table" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "gap-2 h-8 text-xs",
              view === "table" && "bg-primary/12 text-primary shadow-none"
            )}
            onClick={() => setView("table")}
          >
            <Table2 className="h-3.5 w-3.5" />
            Tabela
          </Button>
        </div>

        {view === "cards" && (
          <div className="flex flex-1 flex-col gap-2 min-w-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
            <span className="text-xs font-medium text-muted-foreground shrink-0 sm:mr-1">
              Filtros
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {filterControls(true)}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground shrink-0">
          <span>
            <span className="font-medium text-foreground">{filtered.length}</span>
            {" / "}
            <span className="font-medium text-foreground">{rows.length}</span>
            {" grades"}
          </span>
          {anyFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-primary"
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((grade) => (
            <Card
              key={grade.id}
              className={`${cardClassName}`}
            >
              <CardHeader className="space-y-2 pb-3">
                <div className="flex justify-between items-start gap-3">
                  <CardTitle className="text-lg font-semibold leading-snug text-foreground line-clamp-2 pr-1">
                    {grade.name}
                  </CardTitle>
                  {manage ? (
                    <div className="flex shrink-0 items-center gap-0.5">
                      <EditGradeDialog
                        gradeId={grade.id}
                        initialName={grade.name}
                        initialDescription={grade.description}
                        className="opacity-100"
                      />
                      <DeleteGradeButton
                        gradeId={grade.id}
                        gradeName={grade.name}
                        className="opacity-100"
                      />
                    </div>
                  ) : null}
                </div>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground line-clamp-3 min-h-[3.75rem]">
                  {grade.description?.trim() || "Sem descrição."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4 text-primary shrink-0 opacity-80" />
                    <span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {grade.rulesCount}
                      </span>{" "}
                      regras
                    </span>
                  </div>
                  <GradePlayersHover
                    count={grade.assignmentsCount}
                    players={grade.assignedPlayers}
                    gradeName={grade.name}
                    variant="card"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" asChild className="text-xs border-primary/20">
                    <Link href={`/dashboard/grades/${grade.id}`}>
                      Ver regras
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center rounded-xl border border-dashed border-border bg-muted/20 text-muted-foreground">
              <Archive className="h-10 w-10 mx-auto mb-3 opacity-40 text-primary" />
              <p className="text-foreground/80 font-medium">Nenhuma grade neste filtro.</p>
              {anyFilter && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="mt-2 text-primary"
                  onClick={clearFilters}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <Table className="min-w-[720px] w-full table-fixed">
            <TableHeader>
              <TableRow className="border-b border-border bg-primary/5 hover:bg-primary/5">
                <TableHead className="w-[18%] align-bottom">
                  <ColumnFilter
                    columnId="g-name-t"
                    label="Nome"
                    options={options.name}
                    applied={filters.name}
                    onApply={setCol("name")}
                  />
                </TableHead>
                <TableHead className="w-[40%] align-bottom">
                  <ColumnFilter
                    columnId="g-desc-t"
                    label="Descrição"
                    options={options.description}
                    applied={filters.description}
                    onApply={setCol("description")}
                  />
                </TableHead>
                <TableHead className="w-[10%] align-bottom">
                  <ColumnFilter
                    columnId="g-rules-t"
                    label="Regras"
                    options={options.rules}
                    applied={filters.rules}
                    onApply={setCol("rules")}
                  />
                </TableHead>
                <TableHead className="w-[12%] align-bottom">
                  <ColumnFilter
                    columnId="g-players-t"
                    label="Jogadores"
                    options={options.players}
                    applied={filters.players}
                    onApply={setCol("players")}
                  />
                </TableHead>
                <TableHead className="text-right w-[140px] align-bottom text-foreground font-semibold">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Nenhuma grade com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((grade) => (
                  <TableRow
                    key={grade.id}
                    className="group border-border hover:bg-primary/3"
                  >
                    <TableCell className="font-medium text-foreground align-top py-3">
                      {grade.name}
                    </TableCell>
                    <TableCell className="align-top py-3">
                      {descriptionCell(grade)}
                    </TableCell>
                    <TableCell className="align-top py-3">
                      <span className="tabular-nums font-medium text-foreground">
                        {grade.rulesCount}
                      </span>
                    </TableCell>
                    <TableCell className="align-top py-3">
                      <GradePlayersHover
                        count={grade.assignmentsCount}
                        players={grade.assignedPlayers}
                        gradeName={grade.name}
                        variant="table"
                      />
                    </TableCell>
                    <TableCell className="text-right align-top py-3">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                          <Link href={`/dashboard/grades/${grade.id}`}>
                            Ver regras
                          </Link>
                        </Button>
                        {manage ? (
                          <>
                            <EditGradeDialog
                              gradeId={grade.id}
                              initialName={grade.name}
                              initialDescription={grade.description}
                              className="opacity-100"
                            />
                            <DeleteGradeButton
                              gradeId={grade.id}
                              gradeName={grade.name}
                              className="opacity-100"
                            />
                          </>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}