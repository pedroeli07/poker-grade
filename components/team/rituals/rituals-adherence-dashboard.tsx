"use client";

import { memo, useMemo, useState } from "react";
import {
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { RITUAL_AREA_COLORS } from "@/lib/constants/team/rituals";
import type { RitualDTO } from "@/lib/data/team/rituals-page";
import {
  buildRitualsAdherenceRows,
  shiftAdherenceMonth,
  summarizeRitualsAdherence,
  type RitualAdherenceRowModel,
  type RitualAdherenceSegment,
} from "@/lib/utils/team/rituals-adherence-period";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

const SEGMENT_ORDER: Record<RitualAdherenceSegment, number> = {
  overdue: 0,
  scheduled: 1,
  fulfilled: 2,
  outside: 3,
};

const SEGMENT_STYLES: Record<
  RitualAdherenceSegment,
  { bar: string; label: string; accent: string }
> = {
  fulfilled: {
    accent: "border-l-emerald-500",
    bar: "[&_[data-slot=progress-indicator]]:bg-emerald-500",
    label: "text-emerald-700 dark:text-emerald-400",
  },
  scheduled: {
    accent: "border-l-sky-500",
    bar: "[&_[data-slot=progress-indicator]]:bg-sky-500",
    label: "text-sky-700 dark:text-sky-400",
  },
  overdue: {
    accent: "border-l-amber-500",
    bar: "[&_[data-slot=progress-indicator]]:bg-amber-500",
    label: "text-amber-800 dark:text-amber-400",
  },
  outside: {
    accent: "border-l-border",
    bar: "[&_[data-slot=progress-indicator]]:bg-muted-foreground/30",
    label: "text-muted-foreground",
  },
};

function segmentCaption(row: RitualAdherenceRowModel): string {
  switch (row.segment) {
    case "fulfilled":
      return row.execCountInPeriod === 1
        ? "1 execução no período"
        : `${row.execCountInPeriod} execuções no período`;
    case "scheduled":
      return "Aguardando data de execução";
    case "overdue":
      return "Sem execuções no período";
    case "outside":
      return "Início após este mês";
    default:
      return "";
  }
}

function pctLabel(row: RitualAdherenceRowModel): string {
  if (row.segment === "outside") return "—";
  return row.progressPct >= 100 ? "100%" : "0%";
}

const RitualsAdherenceDashboard = memo(function RitualsAdherenceDashboard({
  rituals,
}: {
  rituals: RitualDTO[];
}) {
  const [refMonth, setRefMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(12, 0, 0, 0);
    return d;
  });

  const rows = useMemo(() => {
    const built = buildRitualsAdherenceRows(rituals, refMonth);
    return [...built].sort(
      (a, b) =>
        SEGMENT_ORDER[a.segment] - SEGMENT_ORDER[b.segment] ||
        a.ritual.name.localeCompare(b.ritual.name, "pt", { sensitivity: "base" }),
    );
  }, [rituals, refMonth]);

  const summary = useMemo(() => summarizeRitualsAdherence(rows), [rows]);

  const titleMonth = format(refMonth, "MMMM yyyy", { locale: ptBR });

  if (rituals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-6 py-14 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
        <p className="mt-3 text-sm font-medium text-foreground">Nenhum ritual para acompanhar</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre rituais na aba Lista para ver adesão por mês.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card via-card to-muted/25 shadow-sm">
      <div className="border-b border-border/60 bg-muted/20 px-5 py-5 md:px-8 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <CalendarRange className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary/90">
                Adesão mensal
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground capitalize md:text-2xl">
              {titleMonth}
            </h3>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Execuções contabilizadas só quando a data registrada cai neste mês. Rituais com início após o
              fim do mês aparecem como fora do período.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-background/90 p-1 shadow-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label="Mês anterior"
              onClick={() => setRefMonth((m) => shiftAdherenceMonth(m, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[10.5rem] px-2 text-center text-sm font-semibold capitalize tabular-nums text-foreground">
              {titleMonth}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label="Próximo mês"
              onClick={() => setRefMonth((m) => shiftAdherenceMonth(m, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-4 py-5 md:px-7 md:py-6">
        {rows.map((row) => {
          const { ritual, segment, progressPct, driLabel } = row;
          const st = SEGMENT_STYLES[segment];
          const areaCls = ritual.area ? RITUAL_AREA_COLORS[ritual.area] : null;

          return (
            <article
              key={ritual.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-border/70 bg-card/95 shadow-sm transition-shadow hover:shadow-md",
                "border-l-4",
                st.accent,
              )}
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:p-5">
                <div className="flex min-w-0 flex-1 gap-3.5">
                  <Avatar className="h-11 w-11 shrink-0 border border-border/60 shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                      {initialsFromName(driLabel)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-semibold leading-snug text-foreground md:text-[1.05rem]">
                        {ritual.name}
                      </h4>
                      {ritual.area ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-6 border-0 px-2 text-[10px] font-semibold uppercase tracking-wide",
                            areaCls ?? "bg-muted text-muted-foreground",
                          )}
                        >
                          {ritual.area}
                        </Badge>
                      ) : null}
                      {ritual.ritualType ? (
                        <Badge variant="secondary" className="h-6 px-2 text-[10px] font-medium">
                          {ritual.ritualType}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground md:text-sm">
                      DRI: <span className="text-foreground/90">{driLabel}</span>
                    </p>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-[min(100%,280px)]">
                  <div className="flex items-end justify-between gap-3">
                    <span className={cn("text-2xl font-bold tabular-nums tracking-tight", st.label)}>
                      {pctLabel(row)}
                    </span>
                    <span className="text-right text-xs font-medium leading-tight text-muted-foreground">
                      {segmentCaption(row)}
                    </span>
                  </div>
                  <Progress
                    value={segment === "outside" ? 0 : progressPct}
                    className={cn("h-2 rounded-full bg-muted/80", st.bar)}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="border-t border-border/60 bg-muted/15 px-4 py-5 md:px-8 md:py-6">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:text-left">
          Resumo do período
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {summary.fulfilledCount}
              </p>
              <p className="text-xs font-medium text-muted-foreground">Cumpridos no mês</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <Clock className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-amber-800 dark:text-amber-300">
                {summary.pendingCount}
              </p>
              <p className="text-xs font-medium text-muted-foreground">Pendentes no mês</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-400">
              <TrendingUp className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-sky-800 dark:text-sky-300">
                {summary.executionsInPeriodTotal}
              </p>
              <p className="text-xs font-medium text-muted-foreground">Execuções registradas</p>
            </div>
          </div>
        </div>
        {summary.applicableCount > 0 ? (
          <p className="mt-4 text-center text-sm text-muted-foreground md:text-left">
            Taxa de adesão no mês:{" "}
            <span className="font-semibold tabular-nums text-foreground">{summary.adherenceRatePct}%</span>
            <span className="text-muted-foreground">
              {" "}
              ({summary.fulfilledCount} de {summary.applicableCount} rituais aplicáveis)
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
});

RitualsAdherenceDashboard.displayName = "RitualsAdherenceDashboard";

export default RitualsAdherenceDashboard;
