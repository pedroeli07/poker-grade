"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LayoutGrid, Table2 } from "lucide-react";
import { ColumnFilter } from "@/components/column-filter";
import { cn } from "@/lib/utils";
import { cardClassName } from "@/lib/constants";
import type { GradeListRow, ColumnKey, GradesColumnOptions, GradesColumnKey, GradesColumnFilters } from "@/lib/types";
import { GradeCard } from "@/components/grades/grade-card";
import { GradeTableRow } from "@/components/grades/grade-table-row";
import { GradesEmptyState } from "@/components/grades/grades-view-components";
import { useGradesListPage } from "@/hooks/grades/use-grades-list-page";

function GradesTableColumnFilter({
  columnId,
  col,
  label,
  options,
  filters,
  setCol,
}: {
  columnId: string;
  col: GradesColumnKey;
  label: string;
  options: GradesColumnOptions;
  filters: GradesColumnFilters;
  setCol: (col: GradesColumnKey) => (next: Set<string> | null) => void;
}) {
  return (
    <ColumnFilter
      columnId={columnId}
      label={label}
      options={options[col]}
      applied={filters[col]}
      onApply={setCol(col)}
    />
  );
}

function GradesListColFilters({
  compact,
  options,
  filters,
  setCol,
}: {
  compact?: boolean;
  options: GradesColumnOptions;
  filters: GradesColumnFilters;
  setCol: (col: GradesColumnKey) => (next: Set<string> | null) => void;
}) {
  return (
    <>
      {(
        [
          ["g-name", "name", "Nome"],
          ["g-desc", "description", "Descrição"],
          ["g-rules", "rules", "Regras"],
          ["g-players", "players", "Jogadores"],
        ] as [string, GradesColumnKey, string][]
      ).map(([id, col, label]) => (
        <ColumnFilter
          key={id}
          columnId={id}
          label={label}
          options={options[col]}
          applied={filters[col]}
          onApply={setCol(col)}
          compact={compact}
        />
      ))}
    </>
  );
}

export default function GradesPageClient({
  rows: initialRows,
  manage,
}: {
  rows: GradeListRow[];
  manage: boolean;
}) {
  const {
    rows,
    view,
    setView,
    filters,
    options,
    filtered,
    anyFilter,
    clearFilters,
    setCol,
  } = useGradesListPage(initialRows);

  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div
          className="inline-flex shrink-0 rounded-lg border border-border p-0.5 bg-muted/30"
          role="group"
          aria-label="Modo de visualização"
        >
          {(["cards", "table"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              variant={view === v ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "gap-2 h-8 text-xs",
                view === v && "bg-primary/12 text-primary shadow-none"
              )}
              onClick={() => setView(v)}
            >
              {v === "cards" ? (
                <LayoutGrid className="h-3.5 w-3.5" />
              ) : (
                <Table2 className="h-3.5 w-3.5" />
              )}
              {v === "cards" ? "Cards" : "Tabela"}
            </Button>
          ))}
        </div>

        {view === "cards" && (
          <div className="flex flex-1 flex-col gap-2 min-w-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
            <span className="text-xs font-medium text-muted-foreground shrink-0 sm:mr-1">
              Filtros
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <GradesListColFilters
                compact
                options={options}
                filters={filters}
                setCol={setCol}
              />
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
            <GradeCard key={grade.id} grade={grade} manage={manage} />
          ))}
          {filtered.length === 0 && (
            <GradesEmptyState anyFilter={anyFilter} clearFilters={clearFilters} />
          )}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <Table className="min-w-[720px] w-full table-fixed">
            <TableHeader>
              <TableRow
                className={`border-b border-border bg-blue-500/20 hover:bg-blue-500/20 ${cardClassName}`}
              >
                {(
                  [
                    ["w-[18%]", "g-name-t", "name", "Nome"],
                    ["w-[40%]", "g-desc-t", "description", "Descrição"],
                    ["w-[10%]", "g-rules-t", "rules", "Regras"],
                    ["w-[12%]", "g-players-t", "players", "Jogadores"],
                  ] as [string, string, ColumnKey, string][]
                ).map(([w, id, col, label]) => (
                  <TableHead key={id} className={`${w} align-bottom`}>
                    <GradesTableColumnFilter
                      columnId={id}
                      col={col}
                      label={label}
                      options={options}
                      filters={filters}
                      setCol={setCol}
                    />
                  </TableHead>
                ))}
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
                  <GradeTableRow key={grade.id} grade={grade} manage={manage} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
