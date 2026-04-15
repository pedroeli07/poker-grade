"use client";

import { BarChart3, ChevronDown } from "lucide-react";
import { memo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import NumberRangeFilter from "@/components/number-range-filter";
import AnalyticsRoiBadge from "@/components/sharkscope/analytics/analytics-roi-badge";
import RankingFinishPctBadge from "@/components/sharkscope/analytics/ranking-finish-pct-badge";
import RankingProfitBadge from "@/components/sharkscope/analytics/ranking-profit-badge";
import { AnalyticsMetricBarChart } from "@/components/sharkscope/analytics/analytics-metric-bar-chart";
import SortButton from "@/components/sort-button";
import SiteNetworkTableCell from "@/components/sharkscope/analytics/site-network-table-cell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NetworkStat, SharkscopeAnalyticsPeriod, SiteAnalyticsPayload } from "@/lib/types";
import { useAnalyticsSitePanel } from "@/hooks/sharkscope/analytics/use-analytics-site-panel";
import { fmtEntries, fmtPct, tdCenter, filterWrap } from "@/lib/utils/sharlscope/analytics/sharkscope-analytics-format";
import { SITE_ANALYTICS_SELECT_TRIGGER_CLASS } from "@/lib/utils/sharlscope/analytics/site-analytics-panel-format";
import { SITE_CHART_Y_METRICS, type SiteChartYMetric } from "@/lib/site-analytics-chart";

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
  const panel = useAnalyticsSitePanel(stats, siteAnalytics, period);

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
                        <SortButton
                          columnKey="network"
                          sort={panel.tableSort}
                          toggleSort={panel.toggleTableSort}
                          kind="string"
                          label="rede"
                        />
                        <ColumnFilter
                          columnId="network"
                          label="Rede"
                          options={panel.networkOptions}
                          applied={panel.filters.network}
                          onApply={panel.setCol("network")}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className={`${filterWrap} flex items-center gap-0.5`}>
                        <SortButton
                          columnKey="roi"
                          sort={panel.tableSort}
                          toggleSort={panel.toggleTableSort}
                          kind="number"
                          label="ROI total"
                        />
                        <NumberRangeFilter
                          label="ROI total %"
                          value={panel.numFilters.roi ?? null}
                          onChange={panel.setNumFilter("roi")}
                          suffix="%"
                          uniqueValues={panel.uniqueRois}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className={`${filterWrap} flex items-center gap-0.5`}>
                        <SortButton
                          columnKey="profit"
                          sort={panel.tableSort}
                          toggleSort={panel.toggleTableSort}
                          kind="number"
                          label="lucro"
                        />
                        <NumberRangeFilter
                          label="Lucro USD"
                          value={panel.numFilters.profit ?? null}
                          onChange={panel.setNumFilter("profit")}
                          suffix="$"
                          uniqueValues={panel.uniqueProfits}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className={`${filterWrap} flex items-center gap-0.5`}>
                        <SortButton
                          columnKey="itm"
                          sort={panel.tableSort}
                          toggleSort={panel.toggleTableSort}
                          kind="number"
                          label="ITM"
                        />
                        <NumberRangeFilter
                          label="ITM %"
                          value={panel.numFilters.itm ?? null}
                          onChange={panel.setNumFilter("itm")}
                          suffix="%"
                          uniqueValues={panel.uniqueItms}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className={`${filterWrap} flex items-center gap-0.5`}>
                        <SortButton
                          columnKey="earlyFinish"
                          sort={panel.tableSort}
                          toggleSort={panel.toggleTableSort}
                          kind="number"
                          label="FP"
                        />
                        <NumberRangeFilter
                          label="Fin. precoce %"
                          value={panel.numFilters.earlyFinish ?? null}
                          onChange={panel.setNumFilter("earlyFinish")}
                          suffix="%"
                          uniqueValues={panel.uniqueEarly}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className={`${filterWrap} flex items-center gap-0.5`}>
                        <SortButton
                          columnKey="lateFinish"
                          sort={panel.tableSort}
                          toggleSort={panel.toggleTableSort}
                          kind="number"
                          label="FT"
                        />
                        <NumberRangeFilter
                          label="Fin. tardia %"
                          value={panel.numFilters.lateFinish ?? null}
                          onChange={panel.setNumFilter("lateFinish")}
                          suffix="%"
                          uniqueValues={panel.uniqueLate}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className={`${filterWrap} flex items-center gap-0.5`}>
                        <SortButton
                          columnKey="count"
                          sort={panel.tableSort}
                          toggleSort={panel.toggleTableSort}
                          kind="number"
                          label="inscrições"
                        />
                        <NumberRangeFilter
                          label="Inscrições"
                          value={panel.numFilters.count ?? null}
                          onChange={panel.setNumFilter("count")}
                          uniqueValues={panel.uniqueCounts}
                        />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {panel.sortedForTable.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Nenhum resultado com os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    panel.sortedForTable.map((s) => (
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
                {panel.chartTitle}
              </p>
              <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 sm:max-w-lg sm:flex-row sm:justify-center sm:gap-5">
                <div className="w-full max-w-[200px] space-y-1.5">
                  <p className="text-center text-sm font-medium text-muted-foreground">Jogadores</p>
                  <Popover open={panel.playerPickerOpen} onOpenChange={panel.setPlayerPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full justify-between font-normal ${SITE_ANALYTICS_SELECT_TRIGGER_CLASS} !bg-white hover:!bg-white aria-expanded:!bg-white dark:!bg-card dark:hover:!bg-card dark:aria-expanded:!bg-card`}
                        disabled={!panel.canFilterPlayers}
                      >
                        <span className="truncate">{panel.triggerLabel}</span>
                        <ChevronDown className="size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[min(100vw-2rem,320px)] p-0" align="start">
                      <div className="space-y-0.5 border-b border-border px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Filtrar por jogador</span>
                          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={panel.clearPlayers}>
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
                            const checked = panel.selectedPlayerIds.includes(p.id);
                            return (
                              <li key={p.id}>
                                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => panel.togglePlayer(p.id)}
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
                  <Select value={panel.yMetric} onValueChange={(v) => panel.setYMetric(v as SiteChartYMetric)}>
                    <SelectTrigger className={SITE_ANALYTICS_SELECT_TRIGGER_CLASS}>
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
                {panel.selectionUsesFallback && (
                  <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-amber-800 dark:text-amber-200">
                    Nenhuma linha por rede para os jogadores selecionados; exibindo o time inteiro.
                  </p>
                )}
                {panel.chartHeuristicNote && (
                  <p className="text-muted-foreground">
                    ITM e finalização precoce/tardia vêm dos torneios agregados do grupo: ITM ≈ torneio com prêmio &gt; 0;
                    FP/FT são heurísticas pela posição vs. field (não são stats oficiais SharkScope).
                  </p>
                )}
              </div>

              <AnalyticsMetricBarChart
                title={panel.chartTitle}
                showTitle={false}
                rows={panel.chartRows}
                yAxisLabel={panel.metricMeta.shortYLabel}
                metric={panel.yMetric}
                tickFormatter={panel.tickFormatter}
                tooltipFormatter={panel.tooltipFormatter}
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
