"use client";

import { BarChart3, ChevronDown } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import NumberRangeFilter from "@/components/number-range-filter";
import {
  AnalyticsRoiBadge,
  RankingFinishPctBadge,
  RankingProfitBadge,
} from "@/components/sharkscope/analytics-cells";
import { AnalyticsMetricBarChart } from "@/components/sharkscope/analytics-metric-bar-chart";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NetworkStat, SharkscopeAnalyticsPeriod, SiteAnalyticsPayload } from "@/lib/types";
import { useSiteAnalytics } from "@/lib/use-sharkscope-analytics";
import { fmtEntries, fmtPct, tdCenter, filterWrap } from "@/lib/utils/sharkscope-analytics-format";
import {
  mergeNetworkStatsForSelection,
  SITE_CHART_Y_METRICS,
  siteChartYValue,
  type SiteChartYMetric,
} from "@/lib/site-analytics-chart";
import { TableColumnSortButton } from "@/components/table-column-sort-button";
import {
  compareNumberNullsLast,
  compareString,
  nextSortState,
  type SortDir,
} from "@/lib/table-sort";
import { POKER_NETWORKS_UI } from "@/lib/constants";

type SiteTableSortKey =
  | "network"
  | "roi"
  | "profit"
  | "itm"
  | "earlyFinish"
  | "lateFinish"
  | "count";

/** Controles do gráfico: fundo branco, sem mudança de cor ao passar o mouse. */
const selectTriggerClassName =
  "w-full h-8 text-sm font-normal px-2 border border-gray-200 bg-white hover:bg-white focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-border dark:bg-card dark:hover:bg-card";

function SiteNetworkTableCell({ network, label }: { network: string; label: string }) {
  const icon = POKER_NETWORKS_UI.find((n) => n.value === network)?.icon;
  return (
    <div className="flex min-w-0 items-center gap-2">
      {icon ? (
        // Logos em /public (ver `lib/constants/poker-networks.ts`)
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={icon}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 rounded object-contain"
        />
      ) : (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
          {label.trim().slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="truncate font-medium">{label}</span>
    </div>
  );
}

const pctFmt = (v: number) => `${v.toFixed(1)}%`;
const profitFmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const entriesFmt = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

function formattersForMetric(metric: SiteChartYMetric) {
  if (metric === "profit") {
    return { tickFormatter: profitFmt, tooltipFormatter: profitFmt };
  }
  if (metric === "entries") {
    return { tickFormatter: entriesFmt, tooltipFormatter: entriesFmt };
  }
  return { tickFormatter: pctFmt, tooltipFormatter: pctFmt };
}

const AnalyticsSitePanel = memo(function AnalyticsSitePanel({
  hasData,
  stats,
  siteAnalytics,
  period,
}: {
  hasData: boolean;
  stats: NetworkStat[];
  siteAnalytics: SiteAnalyticsPayload;
  period: SharkscopeAnalyticsPeriod;
}) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [yMetric, setYMetric] = useState<SiteChartYMetric>("roi");
  const [playerPickerOpen, setPlayerPickerOpen] = useState(false);
  const [tableSort, setTableSort] = useState<{ key: SiteTableSortKey; dir: SortDir } | null>(null);

  const canFilterPlayers =
    siteAnalytics.hasPerPlayerBreakdown && siteAnalytics.playersWithSiteData.length > 0;

  const displayStats = useMemo(() => {
    if (!canFilterPlayers || selectedPlayerIds.length === 0) {
      return stats;
    }
    const rowsList = selectedPlayerIds
      .map((id) => siteAnalytics.byPlayerId[id])
      .filter((r): r is NetworkStat[] => Array.isArray(r) && r.length > 0);
    if (rowsList.length === 0) {
      return stats;
    }
    return mergeNetworkStatsForSelection(rowsList);
  }, [canFilterPlayers, selectedPlayerIds, siteAnalytics.byPlayerId, stats]);

  const selectionUsesFallback =
    canFilterPlayers && selectedPlayerIds.length > 0 && displayStats === stats;

  const {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    filtered,
    networkOptions,
    uniqueRois,
    uniqueProfits,
    uniqueItms,
    uniqueEarly,
    uniqueLate,
    uniqueCounts,
  } = useSiteAnalytics(displayStats);

  const toggleTableSort = useCallback((key: SiteTableSortKey, kind: "number" | "string") => {
    setTableSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const sortedForTable = useMemo(() => {
    if (!tableSort) return filtered;
    const { key, dir } = tableSort;
    const copy = [...filtered];
    copy.sort((a, b) => {
      switch (key) {
        case "network":
          return compareString(a.label, b.label, dir);
        case "roi":
          return compareNumberNullsLast(a.roi, b.roi, dir);
        case "profit":
          return compareNumberNullsLast(a.profit, b.profit, dir);
        case "itm":
          return compareNumberNullsLast(a.itm ?? null, b.itm ?? null, dir);
        case "earlyFinish":
          return compareNumberNullsLast(a.earlyFinish ?? null, b.earlyFinish ?? null, dir);
        case "lateFinish":
          return compareNumberNullsLast(a.lateFinish ?? null, b.lateFinish ?? null, dir);
        case "count":
          return compareNumberNullsLast(a.count, b.count, dir);
        default:
          return 0;
      }
    });
    return copy;
  }, [filtered, tableSort]);

  const metricMeta = SITE_CHART_Y_METRICS.find((m) => m.id === yMetric)!;
  const { tickFormatter, tooltipFormatter } = formattersForMetric(yMetric);

  const chartRows = useMemo(() => {
    return sortedForTable
      .map((s) => {
        const v = siteChartYValue(s, yMetric);
        if (v === null || Number.isNaN(v)) return null;
        return {
          key: s.network,
          shortLabel: s.label.length > 16 ? `${s.label.slice(0, 14)}…` : s.label,
          fullLabel: s.label,
          value: v,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [sortedForTable, yMetric]);

  const periodLabel = period === "30d" ? "últimos 30 dias" : "últimos 90 dias";

  const selectionSummary = useMemo(() => {
    if (!canFilterPlayers || selectedPlayerIds.length === 0) {
      return "time inteiro";
    }
    const names = selectedPlayerIds
      .map((id) => siteAnalytics.playersWithSiteData.find((p) => p.id === id)?.name)
      .filter(Boolean) as string[];
    if (names.length === 0) return "seleção";
    if (names.length === 1) return names[0]!;
    if (names.length === 2) return `${names[0]!} e ${names[1]!}`;
    return `${names.length} jogadores`;
  }, [canFilterPlayers, selectedPlayerIds, siteAnalytics.playersWithSiteData]);

  const chartTitle = `${metricMeta.label} por rede (${periodLabel}) — ${selectionSummary}`;

  const togglePlayer = useCallback((id: string) => {
    setSelectedPlayerIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const clearPlayers = useCallback(() => {
    setSelectedPlayerIds([]);
    setPlayerPickerOpen(false);
  }, []);

  const siteSortBtn = (key: SiteTableSortKey, kind: "number" | "string", label: string) => {
    const active = tableSort?.key === key;
    return (
      <TableColumnSortButton
        ariaLabel={`Ordenar por ${label}`}
        isActive={active}
        direction={active ? tableSort!.dir : null}
        onClick={() => toggleTableSort(key, kind)}
      />
    );
  };

  const triggerLabel = !canFilterPlayers
    ? "Time inteiro"
    : selectedPlayerIds.length === 0
      ? "Time inteiro"
      : selectedPlayerIds.length === 1
        ? siteAnalytics.playersWithSiteData.find((p) => p.id === selectedPlayerIds[0])?.name ?? "1 jogador"
        : `${selectedPlayerIds.length} jogadores`;

  const chartHeuristicNote =
    yMetric === "itm" || yMetric === "earlyFinish" || yMetric === "lateFinish";

  return (
    <div className="space-y-4">
      {!hasData ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-blue-500/10 px-4">
          <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-foreground">Sem estatísticas por rede no cache</p>
          <p className="text-xs mt-2 max-w-xl mx-auto leading-relaxed">
            O gráfico usa torneios do <strong>Player Group</strong> (cache <code className="text-xs">group_site_breakdown_*</code> no cron). Opcional:{" "}
            <code className="text-xs">SHARKSCOPE_ANALYTICS_SITE_FALLBACK_NICKS=1</code> para dados legados por nick×rede.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <section className="min-w-0">
            <h3 className="mb-2 text-base font-semibold text-foreground">Resumo por rede</h3>
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-500/20 hover:bg-blue-500/20">
                    <TableHead className="min-w-[9rem]">
                      <div className="flex items-center gap-0.5">
                        {siteSortBtn("network", "string", "rede")}
                        <ColumnFilter
                          columnId="network"
                          label="Rede"
                          options={networkOptions}
                          applied={filters.network}
                          onApply={setCol("network")}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className={`${filterWrap} flex items-center gap-0.5`}>
                        {siteSortBtn("roi", "number", "ROI total")}
                        <NumberRangeFilter
                          label="ROI total %"
                          value={numFilters.roi ?? null}
                          onChange={setNumFilter("roi")}
                          suffix="%"
                          uniqueValues={uniqueRois}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className={`${filterWrap} flex items-center gap-0.5`}>
                        {siteSortBtn("profit", "number", "lucro")}
                        <NumberRangeFilter
                          label="Lucro USD"
                          value={numFilters.profit ?? null}
                          onChange={setNumFilter("profit")}
                          suffix="$"
                          uniqueValues={uniqueProfits}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className={`${filterWrap} flex items-center gap-0.5`}>
                        {siteSortBtn("itm", "number", "ITM")}
                        <NumberRangeFilter
                          label="ITM %"
                          value={numFilters.itm ?? null}
                          onChange={setNumFilter("itm")}
                          suffix="%"
                          uniqueValues={uniqueItms}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className={`${filterWrap} flex items-center gap-0.5`}>
                        {siteSortBtn("earlyFinish", "number", "FP")}
                        <NumberRangeFilter
                          label="Fin. precoce %"
                          value={numFilters.earlyFinish ?? null}
                          onChange={setNumFilter("earlyFinish")}
                          suffix="%"
                          uniqueValues={uniqueEarly}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className={`${filterWrap} flex items-center gap-0.5`}>
                        {siteSortBtn("lateFinish", "number", "FT")}
                        <NumberRangeFilter
                          label="Fin. tardia %"
                          value={numFilters.lateFinish ?? null}
                          onChange={setNumFilter("lateFinish")}
                          suffix="%"
                          uniqueValues={uniqueLate}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className={`${filterWrap} flex items-center gap-0.5`}>
                        {siteSortBtn("count", "number", "inscrições")}
                        <NumberRangeFilter
                          label="Inscrições"
                          value={numFilters.count ?? null}
                          onChange={setNumFilter("count")}
                          uniqueValues={uniqueCounts}
                        />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedForTable.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Nenhum resultado com os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedForTable.map((s) => (
                      <TableRow key={s.network} className="bg-white hover:bg-sidebar-accent/50">
                        <TableCell className="min-w-[9rem]">
                          <SiteNetworkTableCell network={s.network} label={s.label} />
                        </TableCell>
                        <TableCell className={tdCenter}>
                          <div className={filterWrap}>
                            <AnalyticsRoiBadge roi={s.roi ?? s.roiWeighted} />
                          </div>
                        </TableCell>
                        <TableCell className={tdCenter}>
                          <div className={filterWrap}>
                            <RankingProfitBadge profit={s.profit} />
                          </div>
                        </TableCell>
                        <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>
                          {fmtPct(s.itm ?? null)}
                        </TableCell>
                        <TableCell className={tdCenter}>
                          <div className={filterWrap}>
                            <RankingFinishPctBadge kind="early" pct={s.earlyFinish ?? null} />
                          </div>
                        </TableCell>
                        <TableCell className={tdCenter}>
                          <div className={filterWrap}>
                            <RankingFinishPctBadge kind="late" pct={s.lateFinish ?? null} />
                          </div>
                        </TableCell>
                        <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>
                          {fmtEntries(s.count)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="min-w-0 flex flex-col gap-3">
            <div className="rounded-xl border-2 shadow-md shadow-blue-500/20 bg-white px-3 pb-2 pt-3 sm:px-4 sm:pb-2.5 sm:pt-4 dark:bg-card">
              <p className="mb-3 max-w-full text-left text-sm font-medium leading-snug text-muted-foreground sm:text-base">
                {chartTitle}
              </p>
              <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 sm:max-w-lg sm:flex-row sm:justify-center sm:gap-5">
                <div className="w-full max-w-[200px] space-y-1.5">
                  <p className="text-center text-sm font-medium text-muted-foreground">Jogadores</p>
                  <Popover open={playerPickerOpen} onOpenChange={setPlayerPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full justify-between font-normal ${selectTriggerClassName} !bg-white hover:!bg-white aria-expanded:!bg-white dark:!bg-card dark:hover:!bg-card dark:aria-expanded:!bg-card`}
                        disabled={!canFilterPlayers}
                      >
                        <span className="truncate">{triggerLabel}</span>
                        <ChevronDown className="size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[min(100vw-2rem,320px)] p-0" align="start">
                      <div className="space-y-0.5 border-b border-border px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Filtrar por jogador</span>
                          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={clearPlayers}>
                            Time inteiro
                          </Button>
                        </div>
                        <p className="text-[10px] leading-snug text-muted-foreground pr-1">
                          Jogadores ativos com grupo Shark. Quem tem alerta &quot;grupo não encontrado&quot; fica de fora.
                        </p>
                      </div>
                      <ScrollArea className="h-[min(280px,40vh)]">
                        <ul className="p-2 space-y-1">
                          {siteAnalytics.playersWithSiteData.map((p) => {
                            const checked = selectedPlayerIds.includes(p.id);
                            return (
                              <li key={p.id}>
                                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => togglePlayer(p.id)}
                                    aria-label={p.name}
                                  />
                                  <span className="truncate">{p.name}</span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-full max-w-[200px] space-y-1.5">
                  <p className="text-center text-sm font-medium text-muted-foreground">Eixo Y do gráfico</p>
                  <Select value={yMetric} onValueChange={(v) => setYMetric(v as SiteChartYMetric)}>
                    <SelectTrigger className={selectTriggerClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SITE_CHART_Y_METRICS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-[11px] leading-snug">
                {!siteAnalytics.hasPerPlayerBreakdown && (
                  <p className="text-muted-foreground">
                    Breakdown por jogador ainda não está no cache (aguarde o próximo sync com payload v2). Filtro de
                    jogadores desativado.
                  </p>
                )}
                {selectionUsesFallback && (
                  <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-amber-800 dark:text-amber-200">
                    Nenhuma linha por rede para os jogadores selecionados; exibindo o time inteiro.
                  </p>
                )}
                {chartHeuristicNote && (
                  <p className="text-muted-foreground">
                    ITM e finalização precoce/tardia vêm dos torneios agregados do grupo: ITM ≈ torneio com prêmio &gt; 0;
                    FP/FT são heurísticas pela posição vs. field (não são stats oficiais SharkScope).
                  </p>
                )}
              </div>

              <AnalyticsMetricBarChart
                title={chartTitle}
                showTitle={false}
                rows={chartRows}
                yAxisLabel={metricMeta.shortYLabel}
                metric={yMetric}
                tickFormatter={tickFormatter}
                tooltipFormatter={tooltipFormatter}
                className="mt-2 border-0 bg-transparent p-0 shadow-none"
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
});

AnalyticsSitePanel.displayName = "AnalyticsSitePanel";

export default AnalyticsSitePanel;
