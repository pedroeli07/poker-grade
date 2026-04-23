"use client";

import { useMemo, useState, memo } from "react";
import { Activity, AlertTriangle, Calendar, Info, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import PlayerTourneyStatCard from "@/components/meus-torneios/player-tourney-stat-card";
import { cardHoverLift } from "@/lib/constants/interactive-card";
import {
  formatIndicatorMeta,
  INDICATOR_RESULT_PROCESS,
  INDICATOR_RESULT_TYPE_LABEL,
  indicatorResultTypeBadgeCls,
} from "@/lib/constants/team/indicators-catalog-ui";
import {
  INDICATORS_VG_FILTER_TRIGGER_CLASS,
  INDICATORS_VISAO_GERAL_TIPO_OPTIONS,
} from "@/lib/constants/team/indicators";
import ColumnFilter from "@/components/column-filter";
import PaginationToolbarControls from "@/components/data-table/pagination-toolbar-controls";
import { getTeamIndicatorKpiStatusConfig } from "@/lib/constants/team/indicator-kpi-ui";
import type { TeamIndicatorDTO } from "@/lib/data/team/indicators-page";
import {
  deriveTeamIndicatorKpiStatus,
  formatTeamIndicatorValue,
} from "@/lib/utils/team/team-indicator-kpi";
import { cn } from "@/lib/utils/cn";
import {
  useIndicatorsVisaoGeralPersist,
  VISAO_GERAL_PAGE_SIZE_ALL,
} from "@/hooks/team/use-indicators-visao-geral-persist";

type KpiView = {
  id: string;
  title: string;
  typeLabel: string;
  resultType: string;
  currentValue: string;
  meta: string;
  status: ReturnType<typeof deriveTeamIndicatorKpiStatus>;
  definition: string;
  dri: string;
  driInitials: string;
  glossary?: string;
  acaoAutomatica: string;
};

const sheetActions = [
  { label: "Criar Tarefa", className: "", icon: "plus" as const },
  {
    label: "Marcar em Foco",
    className: "text-red-600 hover:text-red-700 hover:bg-red-50",
    icon: "alert" as const,
  },
  { label: "Avaliar Estudo e Range", className: "", icon: "activity" as const },
  { label: "Agendar 1:1", className: "", icon: "calendar" as const },
] as const;

/** Visual do card do scorecard: borda esquerda + gradiente (Processo = violet, Resultado = azul). */
function kpiScorecardSurfaceClasses(resultType: string) {
  const isProcess = resultType === INDICATOR_RESULT_PROCESS;
  if (isProcess) {
    return cn(
      "border border-violet-200/50 bg-gradient-to-br from-violet-100/95 via-violet-100/60 to-violet-50/55",
      "border-l-[5px] border-l-violet-500 shadow-[0_8px_32px_rgba(139,92,246,0.11),0_2px_10px_rgba(139,92,246,0.07),inset_0_1px_0_0_rgba(255,255,255,0.65)]",
      "hover:border-violet-300/60 hover:shadow-[0_22px_56px_rgba(139,92,246,0.16),0_10px_28px_rgba(139,92,246,0.1)]",
      "dark:border-violet-900/50 dark:from-violet-950/45 dark:via-card dark:to-violet-950/25 dark:shadow-[0_8px_36px_rgba(0,0,0,0.45)] dark:hover:shadow-[0_24px_60px_rgba(139,92,246,0.2)]",
    );
  }
  return cn(
    "border border-blue-200/50 bg-gradient-to-br from-blue-100/95 via-blue-100/60 to-sky-50/55",
    "border-l-[5px] border-l-blue-500 shadow-[0_8px_32px_rgba(37,99,235,0.12),0_2px_10px_rgba(59,130,246,0.07),inset_0_1px_0_0_rgba(255,255,255,0.65)]",
    "hover:border-blue-300/60 hover:shadow-[0_22px_56px_rgba(37,99,235,0.16),0_10px_28px_rgba(59,130,246,0.12)]",
    "dark:border-blue-900/50 dark:from-blue-950/45 dark:via-card dark:to-blue-950/25 dark:shadow-[0_8px_36px_rgba(0,0,0,0.45)] dark:hover:shadow-[0_24px_60px_rgba(37,99,235,0.22)]",
  );
}

function mapIndicatorToKpi(row: TeamIndicatorDTO): KpiView {
  const typeLabel = INDICATOR_RESULT_TYPE_LABEL[row.resultType] ?? row.resultType;
  const unidade = row.unit?.trim() ?? "";
  return {
    id: row.id,
    title: row.name,
    typeLabel,
    resultType: row.resultType,
    currentValue: formatTeamIndicatorValue(row.currentValue, unidade),
    meta: formatIndicatorMeta(row.targetValue, unidade),
    status: deriveTeamIndicatorKpiStatus(row.currentValue, row.targetValue, row.curveType),
    definition: row.definition || "—",
    dri: row.owner?.displayName?.trim() || row.responsibleName?.trim() || "—",
    driInitials: (() => {
      const n = (row.owner?.displayName || row.responsibleName || "—").trim();
      if (n === "—") return "—";
      const p = n.split(/\s+/).filter(Boolean);
      if (p.length >= 2) return (p[0]![0]! + p[1]![0]!).toUpperCase();
      return n.substring(0, 2).toUpperCase();
    })(),
    glossary: row.glossary ?? undefined,
    acaoAutomatica: row.autoAction || "Nenhuma",
  };
}

function IndicatorVisaoGeralDetailBody({ kpi }: { kpi: KpiView }) {
  const sc = getTeamIndicatorKpiStatusConfig(kpi.status);
  return (
    <>
      <SheetHeader className="space-y-4 border-b pb-6 text-left">
        <div className="flex items-start justify-between gap-2">
          <SheetTitle className="pr-2 text-2xl font-bold leading-tight">{kpi.title}</SheetTitle>
          <Badge variant="secondary" className={cn("shrink-0 text-[10px] font-bold", sc.badge)}>
            {sc.label.toLowerCase()}
          </Badge>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "w-fit text-[10px] font-bold uppercase",
            indicatorResultTypeBadgeCls(kpi.resultType || INDICATOR_RESULT_PROCESS),
          )}
        >
          {kpi.typeLabel}
        </Badge>
        <Card className="border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="mb-1 text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Valor atual
            </div>
            <div className="text-4xl font-bold text-foreground">{kpi.currentValue}</div>
            <div className="mt-3 text-xs font-semibold text-muted-foreground">Meta: {kpi.meta}</div>
          </CardContent>
        </Card>
      </SheetHeader>

      <div className="space-y-8 py-6">
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Info className="h-4 w-4 text-muted-foreground" />
            Definição
          </h4>
          <p className="ml-6 text-sm text-muted-foreground">{kpi.definition}</p>
        </div>

        {kpi.glossary ? (
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Info className="h-4 w-4 text-muted-foreground" />
              Glossário
            </h4>
            <p className="ml-6 text-sm text-muted-foreground">{kpi.glossary}</p>
          </div>
        ) : null}

        <div>
          <h4 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
            <Shield className="h-4 w-4" />
            DRI (responsável)
          </h4>
          <div className="ml-6 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-xs font-bold text-primary">
              {kpi.driInitials}
            </div>
            <div className="text-sm font-bold text-foreground">{kpi.dri}</div>
          </div>
        </div>

        {kpi.acaoAutomatica && kpi.acaoAutomatica !== "Nenhuma" && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">Ação automática</h4>
            <p className="ml-1 text-sm font-medium text-primary">{kpi.acaoAutomatica}</p>
          </div>
        )}

        <div>
          <h4 className="mb-4 text-sm font-semibold text-foreground">Ações manuais</h4>
          <div className="grid grid-cols-2 gap-3">
            {sheetActions.map((a) => (
              <Button
                key={a.label}
                type="button"
                variant="outline"
                className={cn("h-10 justify-start bg-background text-xs font-medium", a.className)}
              >
                {a.icon === "plus" && <span className="mr-1 text-base text-muted-foreground">+</span>}
                {a.icon === "alert" && <AlertTriangle className="mr-2 h-3.5 w-3.5" />}
                {a.icon === "activity" && <Activity className="mr-2 h-3.5 w-3.5" />}
                {a.icon === "calendar" && <Calendar className="mr-2 h-3.5 w-3.5" />}
                {a.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function getIndicatorDriLabel(row: TeamIndicatorDTO): string {
  return (row.owner?.displayName?.trim() || row.responsibleName?.trim() || "—") as string;
}

function filterVisaoGeralRows(
  rows: TeamIndicatorDTO[],
  tipo: Set<string> | null,
  dri: Set<string> | null,
  kpi: Set<string> | null,
): TeamIndicatorDTO[] {
  let out = rows;
  if (tipo != null && tipo.size > 0) {
    if (tipo.size < INDICATORS_VISAO_GERAL_TIPO_OPTIONS.length) {
      out = out.filter((r) => tipo.has(r.resultType));
    }
  }
  if (dri != null && dri.size > 0) {
    out = out.filter((r) => {
      const label = getIndicatorDriLabel(r);
      if (label === "—") return dri.has("—");
      return dri.has(label);
    });
  }
  if (kpi != null && kpi.size > 0) {
    out = out.filter((r) => kpi.has(r.id));
  }
  return out;
}

const IndicatorVisaoGeralPanel = memo(function IndicatorVisaoGeralPanel({
  indicators,
}: {
  indicators: TeamIndicatorDTO[];
}) {
  const [selected, setSelected] = useState<KpiView | null>(null);

  const {
    tipoFilter,
    driFilter,
    kpiFilter,
    page,
    pageSize,
    setTipoFilter,
    setDriFilter,
    setKpiFilter,
    setPage,
    setPageSize,
    clearFilters,
    hydrated: vgFiltersHydrated,
  } = useIndicatorsVisaoGeralPersist();

  const anyFilter = tipoFilter != null || driFilter != null || kpiFilter != null;

  const driOptions = useMemo(() => {
    const names = new Set<string>();
    for (const r of indicators) {
      const label = getIndicatorDriLabel(r);
      names.add(label);
    }
    return [...names]
      .filter((n) => n.length > 0)
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((name) => ({ value: name, label: name === "—" ? "Sem DRI" : name }));
  }, [indicators]);

  const kpiOptions = useMemo(
    () =>
      [...indicators]
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
        .map((r) => ({ value: r.id, label: r.name })),
    [indicators],
  );

  const filteredIndicators = useMemo(
    () => filterVisaoGeralRows(indicators, tipoFilter, driFilter, kpiFilter),
    [indicators, tipoFilter, driFilter, kpiFilter],
  );

  const kpis = useMemo(
    () => (filteredIndicators.length ? filteredIndicators.map(mapIndicatorToKpi) : []),
    [filteredIndicators],
  );

  const { paginatedKpis, totalPages, pageClamped, pageItemCount } = useMemo(() => {
    const isAll = pageSize >= VISAO_GERAL_PAGE_SIZE_ALL;
    const matched = kpis.length;
    const tPages = isAll ? 1 : Math.max(1, Math.ceil(matched / pageSize));
    const pClamped = Math.min(Math.max(1, page), tPages);
    const start = isAll ? 0 : (pClamped - 1) * pageSize;
    const slice = isAll ? kpis : kpis.slice(start, start + pageSize);
    return {
      paginatedKpis: slice,
      totalPages: tPages,
      pageClamped: pClamped,
      pageItemCount: slice.length,
    };
  }, [kpis, page, pageSize]);

  const counts = useMemo(
    () => ({
      total: kpis.length,
      success: kpis.filter((k) => k.status === "success").length,
      warning: kpis.filter((k) => k.status === "warning").length,
      danger: kpis.filter((k) => k.status === "danger").length,
    }),
    [kpis],
  );

  const evIndicador = useMemo(
    () => filteredIndicators.find((i) => i.name.toLowerCase().includes("ev operacional")),
    [filteredIndicators],
  );

  if (!vgFiltersHydrated) {
    return (
      <div className="mt-0 space-y-6 pb-12">
        <div
          className="min-h-[min(60vh,520px)] rounded-2xl border border-dashed border-border/60 bg-muted/20"
          aria-busy
        />
      </div>
    );
  }

  return (
    <div className="mt-0 space-y-6 pb-12">
      {evIndicador ? (
        <Card className="relative overflow-hidden border-primary/20 bg-primary/[0.04] shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary/80">
                Métrica central
              </span>
            </div>
            <h2 className="mb-1 text-3xl font-black tracking-tight text-foreground md:text-4xl">
              EV operacional protegido:{" "}
              {formatTeamIndicatorValue(evIndicador.currentValue, evIndicador.unit)}
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              Indicador cadastrado no catálogo com nome contendo &quot;EV operacional&quot;.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PlayerTourneyStatCard label="Total de KPIs" value={counts.total} tone="zinc" />
        <PlayerTourneyStatCard label="No verde" value={counts.success} tone="emerald" />
        <PlayerTourneyStatCard label="Atenção" value={counts.warning} tone="amber" />
        <PlayerTourneyStatCard label="Crítico" value={counts.danger} tone="red" />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Scorecard semanal</h3>
        {indicators.length > 0 ? (
          <div
            className={cn(
              "mb-4 flex w-full min-w-0 flex-col gap-3 rounded-xl border border-border/60 bg-muted/10 p-3 sm:p-3.5",
              "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
            )}
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <ColumnFilter
                columnId="ind-vg-tipo"
                label="Tipo"
                options={INDICATORS_VISAO_GERAL_TIPO_OPTIONS}
                applied={tipoFilter}
                onApply={setTipoFilter}
                compact
                triggerClassName={INDICATORS_VG_FILTER_TRIGGER_CLASS}
              />
              <ColumnFilter
                columnId="ind-vg-dri"
                label="DRI"
                options={driOptions}
                applied={driFilter}
                onApply={setDriFilter}
                compact
                triggerClassName={INDICATORS_VG_FILTER_TRIGGER_CLASS}
              />
              <ColumnFilter
                columnId="ind-vg-kpi"
                label="KPI"
                options={kpiOptions}
                applied={kpiFilter}
                onApply={setKpiFilter}
                compact
                triggerClassName={INDICATORS_VG_FILTER_TRIGGER_CLASS}
              />
              {anyFilter && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-primary"
                  onClick={clearFilters}
                >
                  Limpar
                </Button>
              )}
            </div>
            {kpis.length > 0 ? (
              <div className="flex w-full min-w-0 shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:max-w-full sm:flex-row sm:items-center sm:justify-end">
                <PaginationToolbarControls
                  countSummary={
                    <span className="text-sm text-muted-foreground sm:text-right">
                      <span className="font-medium text-foreground tabular-nums">{kpis.length}</span>
                      {" / "}
                      <span className="font-medium text-foreground tabular-nums">{indicators.length}</span>{" "}
                      no filtro
                      {pageItemCount > 0 ? (
                        <>
                          {" · "}
                          Mostrando{" "}
                          <span className="font-medium text-foreground tabular-nums">{pageItemCount}</span>{" "}
                          nesta página
                        </>
                      ) : null}
                    </span>
                  }
                  page={pageClamped}
                  pageSize={pageSize}
                  total={kpis.length}
                  totalPages={totalPages}
                  onChangePage={(p) => setPage(Math.max(1, Math.min(p, totalPages)))}
                  onChangePageSize={setPageSize}
                />
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {indicators.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
              Nenhum indicador cadastrado. Vá à aba <strong>Catálogo (Admin)</strong> e use o seed
              (ou crie indicadores manualmente) para alimentar este painel.
            </div>
          ) : kpis.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
              Nenhum KPI com a seleção atual. Ajuste os filtros ou{" "}
              <Button type="button" variant="link" className="h-auto p-0 text-primary" onClick={clearFilters}>
                limpar
              </Button>
              .
            </div>
          ) : (
            paginatedKpis.map((kpi) => {
              const cfg = getTeamIndicatorKpiStatusConfig(kpi.status);
              return (
                <div
                  key={kpi.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(kpi)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(kpi);
                    }
                  }}
                  className={cn(
                    "group relative flex min-h-[168px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-5 pb-4",
                    "text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    cardHoverLift,
                    "transition-[transform,box-shadow,filter] duration-500 ease-in-out will-change-transform",
                    "motion-reduce:transition-none",
                    kpiScorecardSurfaceClasses(kpi.resultType),
                  )}
                >
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-white/5"
                    aria-hidden
                  />
                  <div className="absolute top-4 right-4 z-[1]">
                    <div
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-border/50 bg-background/80 shadow-sm backdrop-blur-sm dark:bg-card/80"
                      title={cfg.label}
                    >
                      <div className={cn("h-2 w-2 rounded-full shadow-sm", cfg.dot)} />
                    </div>
                  </div>
                  <div className="relative z-[1] pr-6">
                    <div className="mb-2 flex items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-flex max-w-full items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium shadow-sm",
                          indicatorResultTypeBadgeCls(kpi.resultType || INDICATOR_RESULT_PROCESS),
                        )}
                      >
                        {kpi.typeLabel}
                      </span>
                      <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
                    </div>
                    <div className="mb-1.5 line-clamp-2 text-xs font-medium leading-snug text-muted-foreground">
                      {kpi.title}
                    </div>
                    <div className="text-[1.65rem] font-bold tabular-nums leading-tight tracking-tight text-foreground md:text-[1.75rem]">
                      {kpi.currentValue}
                    </div>
                  </div>
                  <div className="relative z-[1] mt-3 flex items-end justify-between gap-2 border-t border-border/30 pt-3 text-[12px] font-medium text-muted-foreground">
                    <div className="min-w-0">
                      <div>Meta: {kpi.meta}</div>
                      <div className="truncate" title={kpi.dri}>
                        DRI: {kpi.dri}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-sm backdrop-blur-sm",
                        cfg.badge,
                        "border-border/60 dark:border-border/50",
                      )}
                    >
                      {cfg.label}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto p-5 data-[side=right]:max-w-full data-[side=right]:sm:max-w-lg data-[side=right]:lg:max-w-xl sm:p-6 lg:p-7"
        >
          {selected ? <IndicatorVisaoGeralDetailBody kpi={selected} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
});

IndicatorVisaoGeralPanel.displayName = "IndicatorVisaoGeralPanel";
export { IndicatorVisaoGeralPanel };
