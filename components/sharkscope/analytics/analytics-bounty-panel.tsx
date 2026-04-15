"use client";

import { Zap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import NumberRangeFilter from "@/components/number-range-filter";
import AnalyticsProfitCell from "@/components/sharkscope/analytics/analytics-profit-cell";
import AnalyticsRoiBadge from "@/components/sharkscope/analytics/analytics-roi-badge";
import AnalyticsRoiBarChart from "@/components/sharkscope/analytics/analytics-roi-bar-chart";
import SortButton from "@/components/sort-button";
import { SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT } from "@/lib/constants/sharkscope/analytics/sharkscope-analytics-labels";
import type { SharkscopeAnalyticsPeriod, TypeStat } from "@/lib/types";
import { memo } from "react";
import { useBountyAnalytics } from "@/lib/use-sharkscope-analytics";
import { fmtEntries } from "@/lib/utils/sharlscope/analytics/sharkscope-analytics-format";

const AnalyticsBountyPanel = memo(function AnalyticsBountyPanel({
  period,
  hasTypeData,
  typeStats30d,
}: {
  period: SharkscopeAnalyticsPeriod;
  hasTypeData: boolean;
  typeStats30d: TypeStat[];
}) {
  const {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    typeOptions,
    barRows,
    uniqueRois,
    uniqueRoiWeighted,
    uniqueProfits,
    uniqueCounts,
    sort,
    toggleSort,
    sorted,
  } = useBountyAnalytics(typeStats30d);

  return (
    <div className="space-y-4">
      {period === "90d" && (
        <p className="text-xs text-muted-foreground rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
          Breakdown Bounty / Vanilla / Satélite usa filtros SharkScope na janela de <strong>30 dias</strong> (buscas extras na sincronização). O seletor <strong>90d</strong> acima afeta Por Site, Ranking e Por TIER.
        </p>
      )}
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
                <TableHead>
                  <div className="flex items-center gap-0.5">
                    <SortButton columnKey="roi" sort={sort} toggleSort={toggleSort} kind="number" label="ROI médio" />
                    <NumberRangeFilter label="Média (ROI)" value={numFilters.roi ?? null} onChange={setNumFilter("roi")} suffix="%" uniqueValues={uniqueRois} />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-0.5">
                    <SortButton columnKey="roiWeighted" sort={sort} toggleSort={toggleSort} kind="number" label="ROI ponderado" />
                    <NumberRangeFilter label="ROI ponds." value={numFilters.roiWeighted ?? null} onChange={setNumFilter("roiWeighted")} suffix="%" uniqueValues={uniqueRoiWeighted} />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-0.5">
                    <SortButton columnKey="profit" sort={sort} toggleSort={toggleSort} kind="number" label="lucro" />
                    <NumberRangeFilter label="Lucro" value={numFilters.profit ?? null} onChange={setNumFilter("profit")} suffix="$" uniqueValues={uniqueProfits} />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-0.5">
                    <SortButton columnKey="count" sort={sort} toggleSort={toggleSort} kind="number" label="volume" />
                    <NumberRangeFilter label="Volume" value={numFilters.count ?? null} onChange={setNumFilter("count")} uniqueValues={uniqueCounts} />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum resultado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((s) => (
                  <TableRow key={s.type} className="hover:bg-sidebar-accent/50 bg-white">
                    <TableCell className="font-medium">{SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type]}</TableCell>
                    <TableCell>
                      <AnalyticsRoiBadge roi={s.roi} />
                    </TableCell>
                    <TableCell>
                      <AnalyticsRoiBadge roi={s.roiWeighted} />
                    </TableCell>
                    <TableCell>
                      <AnalyticsProfitCell profit={s.profit} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtEntries(s.count)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {hasTypeData && <AnalyticsRoiBarChart title="ROI total por tipo de torneo (30d, filtros SharkScope Type:B / SAT / outros)" rows={barRows} />}
    </div>
  );
});

AnalyticsBountyPanel.displayName = "AnalyticsBountyPanel";

export default AnalyticsBountyPanel;
