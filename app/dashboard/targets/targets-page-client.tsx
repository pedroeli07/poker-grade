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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Target,
  LayoutGrid,
  Table2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { ColumnFilter } from "@/components/column-filter";
import { distinctOptions } from "@/lib/distinct-options";

export type TargetListRow = {
  id: string;
  name: string;
  category: string;
  playerId: string;
  playerName: string;
  status: "ON_TRACK" | "ATTENTION" | "OFF_TRACK";
  targetType: "NUMERIC" | "TEXT";
  limitAction: "UPGRADE" | "MAINTAIN" | "DOWNGRADE" | null;
  numericValue: number | null;
  numericCurrent: number | null;
  textValue: string | null;
  textCurrent: string | null;
  unit: string | null;
  coachNotes: string | null;
};

const STATUS_CONFIG = {
  ON_TRACK: {
    label: "No Caminho",
    icon: CheckCircle2,
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  },
  ATTENTION: {
    label: "Atenção",
    icon: AlertTriangle,
    bg: "bg-amber-500/10 border-amber-500/20 text-amber-500",
  },
  OFF_TRACK: {
    label: "Fora da Meta",
    icon: XCircle,
    bg: "bg-red-500/10 border-red-500/20 text-red-500",
  },
} as const;

const LIMIT_ACTION_LABEL: Record<
  "UPGRADE" | "MAINTAIN" | "DOWNGRADE",
  { label: string; color: string }
> = {
  UPGRADE: { label: "Subida", color: "text-emerald-600" },
  MAINTAIN: { label: "Manutenção", color: "text-muted-foreground" },
  DOWNGRADE: { label: "Descida", color: "text-red-600" },
};

const NONE_LIMIT = "__none__";

type ColKey =
  | "name"
  | "category"
  | "player"
  | "status"
  | "targetType"
  | "limitAction";

type Filters = Record<ColKey, Set<string> | null>;

function progressLabel(r: TargetListRow) {
  if (r.targetType === "NUMERIC" && r.numericValue != null) {
    return `${r.numericCurrent ?? "—"} / ${r.numericValue}${r.unit ? ` ${r.unit}` : ""}`;
  }
  if (r.targetType === "TEXT") {
    const cur = r.textCurrent ?? "—";
    const val = r.textValue ?? "—";
    return `${cur} / ${val}`;
  }
  return "—";
}

function statusLabel(s: TargetListRow["status"]) {
  return STATUS_CONFIG[s].label;
}

function targetCardInner(target: TargetListRow) {
  const cfg = STATUS_CONFIG[target.status];
  const StatusIcon = cfg.icon;
  const limitCfg = target.limitAction
    ? LIMIT_ACTION_LABEL[target.limitAction]
    : null;

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 space-y-1.5 flex-1">
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-semibold text-sm leading-tight">{target.name}</span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-border/50 shrink-0"
          >
            {target.category}
          </Badge>
        </div>
        {limitCfg && (
          <span className={`text-xs block ${limitCfg.color}`}>
            Gatilho: {limitCfg.label}
          </span>
        )}
        <p className="text-xs text-muted-foreground">
          Jogador:{" "}
          <Link
            href={`/dashboard/players/${target.playerId}`}
            className="hover:text-primary font-medium text-foreground"
          >
            {target.playerName}
          </Link>
        </p>
        {target.targetType === "NUMERIC" && target.numericValue != null ? (
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-0">
              {target.numericCurrent != null && target.numericValue > 0 && (
                <div
                  className={`h-full rounded-full ${
                    target.status === "ON_TRACK"
                      ? "bg-emerald-500"
                      : target.status === "ATTENTION"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (target.numericCurrent / target.numericValue) * 100
                      )
                    )}%`,
                  }}
                />
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
              <strong className="text-foreground">
                {target.numericCurrent ?? "—"}
              </strong>
              {" / "}
              {target.numericValue}
              {target.unit && <span className="ml-0.5">{target.unit}</span>}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground tabular-nums pt-0.5">
            {progressLabel(target)}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground/80 pt-0.5">
          Meta definida pelo coach para o ciclo atual.
        </p>
        {target.coachNotes && (
          <p className="text-xs text-muted-foreground italic line-clamp-2">
            {target.coachNotes}
          </p>
        )}
      </div>
      <Badge
        className={`${cfg.bg} shrink-0 flex items-center gap-1 text-xs border self-start`}
      >
        <StatusIcon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    </div>
  );
}

export function TargetsPageClient({ rows }: { rows: TargetListRow[] }) {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [filters, setFilters] = useState<Filters>({
    name: null,
    category: null,
    player: null,
    status: null,
    targetType: null,
    limitAction: null,
  });

  const options = useMemo(
    () => ({
      name: distinctOptions(rows, (r) => ({ value: r.name, label: r.name })),
      category: distinctOptions(rows, (r) => ({
        value: r.category,
        label: r.category,
      })),
      player: distinctOptions(rows, (r) => ({
        value: r.playerId,
        label: r.playerName,
      })),
      status: distinctOptions(rows, (r) => ({
        value: r.status,
        label: statusLabel(r.status),
      })),
      targetType: distinctOptions(rows, (r) => ({
        value: r.targetType,
        label: r.targetType === "NUMERIC" ? "Numérico" : "Texto",
      })),
      limitAction: distinctOptions(rows, (r) => {
        const v = r.limitAction ?? NONE_LIMIT;
        const label = r.limitAction
          ? `Gatilho: ${LIMIT_ACTION_LABEL[r.limitAction].label}`
          : "Sem gatilho";
        return { value: v, label };
      }),
    }),
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filters.name && !filters.name.has(r.name)) return false;
      if (filters.category && !filters.category.has(r.category))
        return false;
      if (filters.player && !filters.player.has(r.playerId)) return false;
      if (filters.status && !filters.status.has(r.status)) return false;
      if (filters.targetType && !filters.targetType.has(r.targetType))
        return false;
      const lim = r.limitAction ?? NONE_LIMIT;
      if (filters.limitAction && !filters.limitAction.has(lim))
        return false;
      return true;
    });
  }, [rows, filters]);

  const setCol = (col: ColKey) => (next: Set<string> | null) => {
    setFilters((f) => ({ ...f, [col]: next }));
  };

  const anyFilter = Object.values(filters).some((x) => x !== null);

  if (rows.length === 0) {
    return (
      <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
            <Target className="h-10 w-10 mx-auto mb-4 opacity-40" />
            <p className="font-medium">Nenhum target definido.</p>
            <p className="text-sm mt-1">
              Targets ajudam a justificar matematicamente as subidas de limite.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Todos os Targets</CardTitle>
            <CardDescription>
              Metas individuais estabelecidas para os jogadores do time.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="inline-flex rounded-lg border border-border p-1 bg-muted/40  "
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
        </div>

        {view === "cards" && anyFilter && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
            <span className="text-muted-foreground">
              Filtros ativos ({filtered.length} de {rows.length}). Ajuste na
              visão <strong className="text-foreground">Tabela</strong>.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs shrink-0"
              onClick={() =>
                setFilters({
                  name: null,
                  category: null,
                  player: null,
                  status: null,
                  targetType: null,
                  limitAction: null,
                })
              }
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {view === "cards" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((target) => (
              <div
                key={target.id}
                className="rounded-xl border-2 border-border/60 bg-card/50 p-4 hover:border-border transition-colors flex flex-col min-h-[140px]"
              >
                {targetCardInner(target)}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
                Nenhum target com os filtros atuais.
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
                      category: null,
                      player: null,
                      status: null,
                      targetType: null,
                      limitAction: null,
                    })
                  }
                >
                  Limpar todos os filtros
                </Button>
              </div>
            )}
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-500/10 hover:bg-transparent">
                    <TableHead>
                      <ColumnFilter
                        columnId="t-name"
                        label="Nome"
                        options={options.name}
                        applied={filters.name}
                        onApply={setCol("name")}
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnFilter
                        columnId="t-cat"
                        label="Categoria"
                        options={options.category}
                        applied={filters.category}
                        onApply={setCol("category")}
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnFilter
                        columnId="t-player"
                        label="Jogador"
                        options={options.player}
                        applied={filters.player}
                        onApply={setCol("player")}
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnFilter
                        columnId="t-status"
                        label="Status"
                        options={options.status}
                        applied={filters.status}
                        onApply={setCol("status")}
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnFilter
                        columnId="t-type"
                        label="Tipo"
                        options={options.targetType}
                        applied={filters.targetType}
                        onApply={setCol("targetType")}
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnFilter
                        columnId="t-limit"
                        label="Gatilho"
                        options={options.limitAction}
                        applied={filters.limitAction}
                        onApply={setCol("limitAction")}
                      />
                    </TableHead>
                    <TableHead>Progresso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-muted-foreground"
                      >
                        Nenhum target com os filtros atuais.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((target) => {
                      const cfg = STATUS_CONFIG[target.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <TableRow
                          key={target.id}
                          className="hover:bg-sidebar-accent/50"
                        >
                          <TableCell className="font-medium">
                            {target.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              {target.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/players/${target.playerId}`}
                              className="text-sm font-medium hover:text-primary"
                            >
                              {target.playerName}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${cfg.bg} flex w-fit items-center gap-1 text-xs border`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {cfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {target.targetType === "NUMERIC"
                              ? "Numérico"
                              : "Texto"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {target.limitAction ? (
                              <span
                                className={
                                  LIMIT_ACTION_LABEL[target.limitAction]
                                    .color
                                }
                              >
                                {LIMIT_ACTION_LABEL[target.limitAction].label}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums max-w-[200px]">
                            {progressLabel(target)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
