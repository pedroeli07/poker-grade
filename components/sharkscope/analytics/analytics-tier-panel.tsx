"use client";

import { memo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import NumberRangeFilter from "@/components/number-range-filter";
import AnalyticsRoiBadge from "@/components/sharkscope/analytics/analytics-roi-badge";
import RankingAbilityBadge from "@/components/sharkscope/analytics/ranking-ability-badge";
import RankingFinishPctBadge from "@/components/sharkscope/analytics/ranking-finish-pct-badge";
import RankingProfitBadge from "@/components/sharkscope/analytics/ranking-profit-badge";
import { AnalyticsMetricBarChart } from "@/components/sharkscope/analytics/analytics-metric-bar-chart";
import SortButton from "@/components/sort-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SharkscopeAnalyticsPeriod, TierStat } from "@/lib/types";
import { useTierAnalytics } from "@/lib/use-sharkscope-analytics";
import { fmtEntries, fmtPct, fmtStake, tdCenter, filterWrap } from "@/lib/utils/sharlscope/analytics/sharkscope-analytics-format";
import { SITE_ANALYTICS_SELECT_TRIGGER_CLASS } from "@/lib/utils/sharlscope/analytics/site-analytics-panel-format";
import { SITE_CHART_Y_METRICS, type SiteChartYMetric } from "@/lib/site-analytics-chart";

const AnalyticsTierPanel = memo(function AnalyticsTierPanel({
  period,
  tierStats,
}: {
  period: SharkscopeAnalyticsPeriod;
  tierStats: TierStat[];
}) {
  const panel = useTierAnalytics(tierStats, period);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Consolidado por <strong className="text-foreground">tier</strong> usando o ABI médio (AvStake) no cache{" "}
        <code className="text-[10px]">statistics</code> do Player Group (mesma base que Por site). Faixas: Micro (até $10),
        Low ($10–$25), Low-Mid ($25–$50), Mid ($50–$150), High ($150+). Período:{" "}
        <span className="font-medium text-foreground">{period}</span>.
      </p>
      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-500/20 hover:bg-blue-500/20">
              <TableHead className="min-w-[9rem]">
                <div className="flex items-center gap-0.5">
                  <SortButton
                    columnKey="tier"
                    sort={panel.tableSort}
                    toggleSort={panel.toggleTableSort}
                    kind="string"
                    label="tier"
                  />
                  <ColumnFilter
                    columnId="tier"
                    label="Tier"
                    options={panel.tierOptions}
                    applied={panel.filters.tier}
                    onApply={panel.setCol("tier")}
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
                    label="ROI Total "
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
                    columnKey="entries"
                    sort={panel.tableSort}
                    toggleSort={panel.toggleTableSort}
                    kind="number"
                    label="inscrições"
                  />
                  <NumberRangeFilter
                    label="Inscrições"
                    value={panel.numFilters.entries ?? null}
                    onChange={panel.setNumFilter("entries")}
                    uniqueValues={panel.uniqueEntries}
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
                    label="Lucro"
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
                    label="ITM "
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
                    columnKey="ability"
                    sort={panel.tableSort}
                    toggleSort={panel.toggleTableSort}
                    kind="number"
                    label="capacidade"
                  />
                  <NumberRangeFilter
                    label="Capacidade"
                    value={panel.numFilters.ability ?? null}
                    onChange={panel.setNumFilter("ability")}
                    uniqueValues={panel.uniqueAbilities}
                  />
                </div>
              </TableHead>
              <TableHead className="whitespace-nowrap">
                <div className={`${filterWrap} flex items-center gap-0.5`}>
                  <SortButton
                    columnKey="avStake"
                    sort={panel.tableSort}
                    toggleSort={panel.toggleTableSort}
                    kind="number"
                    label="stake médio"
                  />
                  <NumberRangeFilter
                    label="Stake méd."
                    value={panel.numFilters.avStake ?? null}
                    onChange={panel.setNumFilter("avStake")}
                    suffix="$"
                    uniqueValues={panel.uniqueAvStakes}
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
                    label="Finalização precoce "
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
                    label="Finalização tardia "
                    value={panel.numFilters.lateFinish ?? null}
                    onChange={panel.setNumFilter("lateFinish")}
                    suffix="%"
                    uniqueValues={panel.uniqueLate}
                  />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {panel.sortedForTable.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  Nenhum resultado com os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              panel.sortedForTable.map((s) => (
                <TableRow key={s.tier} className="bg-white hover:bg-sidebar-accent/50">
                  <TableCell className="min-w-[9rem] font-medium text-sm">{s.label}</TableCell>
                  <TableCell className={tdCenter}>
                    <div className={filterWrap}>
                      <AnalyticsRoiBadge roi={s.roi ?? s.roiWeighted} />
                    </div>
                  </TableCell>
                  <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>
                    {fmtEntries(s.entries)}
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
                      <RankingAbilityBadge ability={s.ability} />
                    </div>
                  </TableCell>
                  <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>
                    {fmtStake(s.avStake)}
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <section className="min-w-0 flex flex-col gap-3">
        <div className="rounded-xl border-2 shadow-md shadow-blue-500/20 bg-white px-3 pb-2 pt-3 sm:px-4 sm:pb-2.5 sm:pt-4 dark:bg-card">
          <p className="mb-3 max-w-full text-left text-sm font-medium leading-snug text-muted-foreground sm:text-base">
            {panel.chartTitle}
          </p>
          <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 sm:max-w-lg sm:flex-row sm:justify-center sm:gap-5">
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
  );
});

AnalyticsTierPanel.displayName = "AnalyticsTierPanel";

export default AnalyticsTierPanel;
