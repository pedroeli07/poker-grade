"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Target, LayoutGrid, Table2 } from "lucide-react";
import { ColumnFilter } from "@/components/column-filter";
import type { TargetListRow, Filters, TargetsColumnOptions, ColKey } from "@/lib/types";
import { useTargetsListPage } from "../../../hooks/targets/use-targets-list-page";

import { TargetCard } from "@/components/targets/target-card";
import { TargetTableRow } from "@/components/targets/target-table-row";
import { TargetsEmptyState } from "@/components/targets/targets-view-components";

function TargetsColFilters({
  compact = false,
  options,
  filters,
  setCol,
}: {
  compact?: boolean;
  options: TargetsColumnOptions;
  filters: Filters;
  setCol: (col: ColKey) => (next: Set<string> | null) => void;
}) {
  return (
    <>
      {(
        [
          ["t-name", "name", "Meta"],
          ["t-cat", "category", "Categoria"],
          ["t-type", "targetType", "Tipo"],
          ["t-player", "playerName", "Jogador"],
          ["t-status", "status", "Status"],
        ] as [string, ColKey, string][]
      ).map(([id, col, label]) => (
        <ColumnFilter
          key={id}
          columnId={id}
          label={label}
          options={options[col] || []}
          applied={filters[col]}
          onApply={setCol(col)}
          compact={compact}
        />
      ))}
    </>
  );
}

export default function TargetsPageClient({ rows: initialRows }: { rows: TargetListRow[] }) {
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
  } = useTargetsListPage(initialRows);

  const viewControls = (
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
          className={`gap-2 h-8 text-xs ${
            view === v ? "bg-primary/12 text-primary shadow-none" : ""
          }`}
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
  );

  return (
    <Card className="rounded-xl border border-border/80 shadow-sm overflow-hidden bg-card/60">
      <CardHeader className="bg-muted/10 border-b border-border/40 pb-5 pt-6 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="h-4 w-4 text-primary" />
              </div>
              Controle de Targets
            </CardTitle>
            <CardDescription className="mt-1">
              Gerencie e acompanhe todos os targets ativos dos jogadores.
            </CardDescription>
          </div>
          {viewControls}
        </div>

        {view === "cards" && (
          <div className="mt-4 flex flex-col gap-2 min-w-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
            <span className="text-xs font-medium text-muted-foreground shrink-0 sm:mr-1">
              Filtros
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <TargetsColFilters
                compact
                options={options}
                filters={filters}
                setCol={setCol}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Results Info Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/5 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{filtered.length}</span> /{" "}
            <span className="font-medium text-foreground">{rows.length}</span>{" "}
            targets
          </span>
          {anyFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-primary bg-primary/5 hover:bg-primary/15"
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          )}
        </div>

        {view === "cards" ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((target) => (
                <div
                  key={target.id}
                  className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                >
                  <TargetCard target={target} />
                </div>
              ))}
              {filtered.length === 0 && (
                <TargetsEmptyState anyFilter={anyFilter} clearFilters={clearFilters} />
              )}
            </div>
          </div>
        ) : (
          <div className="w-full relative overflow-x-auto">
            <Table className="min-w-[720px] w-full table-fixed">
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/20 hover:bg-muted/20">
                  {(
                    [
                      ["w-[30%]", "t-name-t", "name", "Meta"],
                      ["w-[25%]", "t-player-t", "playerName", "Jogador"],
                      ["w-[25%]", "t-progr-t", "targetType", "Progresso"],
                      ["w-[20%]", "t-status-t", "status", "Status"],
                    ] as [string, string, ColKey, string][]
                  ).map(([w, id, col, label]) => (
                    <TableHead
                      key={id}
                      className={`${w} align-bottom h-12 ${col === "status" ? "text-right pr-4" : ""}`}
                    >
                      <ColumnFilter
                        columnId={id}
                        label={label}
                        options={options[col] || []}
                        applied={filters[col]}
                        onApply={setCol(col)}
                      />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-12 text-muted-foreground"
                    >
                      Nenhum target com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((target) => (
                    <TargetTableRow key={target.id} target={target} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
