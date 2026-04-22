"use client";

import { Zap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import NumberRangeFilter from "@/components/number-range-filter";
import AnalyticsRoiBadge from "@/components/sharkscope/analytics/analytics-roi-badge";
import AnalyticsRoiBarChart from "@/components/sharkscope/analytics/analytics-roi-bar-chart";
import RankingAbilityBadge from "@/components/sharkscope/analytics/ranking-ability-badge";
import RankingFinishPctBadge from "@/components/sharkscope/analytics/ranking-finish-pct-badge";
import RankingProfitBadge from "@/components/sharkscope/analytics/ranking-profit-badge";
import SortButton from "@/components/sort-button";
import { SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT } from "@/lib/constants/sharkscope/analytics";
import type { SharkscopeAnalyticsPeriod } from "@/lib/types/sharkscope/analytics/index";
import type { TypeStat } from "@/lib/types/sharkScopeTypes";
import { memo } from "react";
import { useBountyAnalytics } from "@/lib/use-sharkscope-analytics";
import {
  fmtEntries,
  fmtPct,
  fmtStake,
  tdCenter,
  filterWrap,
} from "@/lib/utils/sharkscope/analytics";

const AnalyticsBountyPanel = memo(function AnalyticsBountyPanel({
  period,
  hasTypeData,
  typeStats,
}: {
  period: SharkscopeAnalyticsPeriod;
  hasTypeData: boolean;
  typeStats: TypeStat[];
}) {
  const {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    typeOptions,
    barRows,
    uniqueRois,
    uniqueEntries,
    uniqueProfits,
    uniqueItms,
    uniqueAbilities,
    uniqueStakes,
    uniqueEarly,
    uniqueLate,
    sort,
    toggleSort,
    sorted,
  } = useBountyAnalytics(typeStats);

  const periodLabel = period === "30d" ? "30 dias" : "90 dias";
  const chartTitle =
    period === "30d"
      ? "ROI total por tipo de torneo (30d, filtros Type:B / SAT / outros)"
      : "ROI total por tipo de torneo (90d, filtros Type:B / SAT / outros)";

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground rounded-lg border border-border/60 bg-muted/20 px-3 py-2 leading-relaxed">
        Agregados por tipo (Bounty, Satélite, Vanilla) na janela de <strong>{periodLabel}</strong>, calculados a partir dos{" "}
        <strong>torneios completados</strong> no sync (mesmo custo de API que o breakdown por site — sem pedidos extra por tipo). Use o seletor{" "}
        <strong>30d / 90d</strong> no topo para alternar.
      </p>
      {!hasTypeData ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-amber-500/10">
          <Zap className="h-10 w-10 mx-auto mb-3 opacity-30 text-amber-500" />
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-500 mb-1">Sem dados por tipo de torneo</h3>
          <p className="text-xs max-w-lg mx-auto">
            Rode <strong>Sincronizar SharkScope</strong> para buscar estatísticas com filtros Type:B (Bounty), Type:SAT (Satélite) e excluindo ambos (Vanilla), além do resumo geral.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-amber-500/15 hover:bg-amber-500/15">
                <TableHead className="min-w-40">
                  <div className="flex items-center gap-0.5">
                    <SortButton columnKey="type" sort={sort} toggleSort={toggleSort} kind="string" label="tipo" />
                    <ColumnFilter columnId="type" label="Tipo" options={typeOptions} applied={filters.type} onApply={setCol("type")} />
                  </div>
                </TableHead>
                <TableHead className={tdCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="roi" sort={sort} toggleSort={toggleSort} kind="number" label="ROI total" />
                      <NumberRangeFilter label="ROI total %" value={numFilters.roi ?? null} onChange={setNumFilter("roi")} suffix="%" uniqueValues={uniqueRois} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={tdCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="entries" sort={sort} toggleSort={toggleSort} kind="number" label="inscrições" />
                      <NumberRangeFilter label="Inscrições" value={numFilters.entries ?? null} onChange={setNumFilter("entries")} uniqueValues={uniqueEntries} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={tdCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="profit" sort={sort} toggleSort={toggleSort} kind="number" label="lucro" />
                      <NumberRangeFilter label="Lucro" value={numFilters.profit ?? null} onChange={setNumFilter("profit")} suffix="$" uniqueValues={uniqueProfits} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={tdCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="itm" sort={sort} toggleSort={toggleSort} kind="number" label="ITM" />
                      <NumberRangeFilter label="ITM %" value={numFilters.itm ?? null} onChange={setNumFilter("itm")} suffix="%" uniqueValues={uniqueItms} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={tdCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="ability" sort={sort} toggleSort={toggleSort} kind="number" label="capacidade" />
                      <NumberRangeFilter label="Capacidade" value={numFilters.ability ?? null} onChange={setNumFilter("ability")} uniqueValues={uniqueAbilities} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={tdCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="avStake" sort={sort} toggleSort={toggleSort} kind="number" label="stake médio" />
                      <NumberRangeFilter label="Stake méd." value={numFilters.avStake ?? null} onChange={setNumFilter("avStake")} suffix="$" uniqueValues={uniqueStakes} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={tdCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="earlyFinish" sort={sort} toggleSort={toggleSort} kind="number" label="FP" />
                      <NumberRangeFilter label="Finalização precoce " value={numFilters.earlyFinish ?? null} onChange={setNumFilter("earlyFinish")} suffix="%" uniqueValues={uniqueEarly} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={tdCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="lateFinish" sort={sort} toggleSort={toggleSort} kind="number" label="FT" />
                      <NumberRangeFilter label="Finalização tardia " value={numFilters.lateFinish ?? null} onChange={setNumFilter("lateFinish")} suffix="%" uniqueValues={uniqueLate} />
                    </div>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    Nenhum resultado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((s) => (
                  <TableRow key={s.type} className="hover:bg-sidebar-accent/50 bg-white">
                    <TableCell className="font-medium">{SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type]}</TableCell>
                    <TableCell className={tdCenter}>
                      <div className={filterWrap}>
                        <AnalyticsRoiBadge roi={s.roi} />
                      </div>
                    </TableCell>
                    <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>{fmtEntries(s.entries)}</TableCell>
                    <TableCell className={tdCenter}>
                      <div className={filterWrap}>
                        <RankingProfitBadge profit={s.profit} />
                      </div>
                    </TableCell>
                    <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>{fmtPct(s.itm)}</TableCell>
                    <TableCell className={tdCenter}>
                      <div className={filterWrap}>
                        <RankingAbilityBadge ability={s.ability} />
                      </div>
                    </TableCell>
                    <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>{fmtStake(s.avStake)}</TableCell>
                    <TableCell className={tdCenter}>
                      <div className={filterWrap}>
                        <RankingFinishPctBadge kind="early" pct={s.earlyFinish} />
                      </div>
                    </TableCell>
                    <TableCell className={tdCenter}>
                      <div className={filterWrap}>
                        <RankingFinishPctBadge kind="late" pct={s.lateFinish} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {hasTypeData && <AnalyticsRoiBarChart title={chartTitle} rows={barRows} />}
    </div>
  );
});

AnalyticsBountyPanel.displayName = "AnalyticsBountyPanel";

export default AnalyticsBountyPanel;
