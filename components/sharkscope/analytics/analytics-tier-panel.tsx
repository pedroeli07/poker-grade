"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import NumberRangeFilter from "@/components/number-range-filter";
import AnalyticsProfitCell from "@/components/sharkscope/analytics/analytics-profit-cell";
import AnalyticsRoiBadge from "@/components/sharkscope/analytics/analytics-roi-badge";
import AnalyticsRoiBarChart from "@/components/sharkscope/analytics/analytics-roi-bar-chart"; 
import SortButton from "@/components/sort-button";
import type { SharkscopeAnalyticsPeriod, TierStat } from "@/lib/types";
import { memo } from "react";
import { useTierAnalytics } from "@/lib/use-sharkscope-analytics";
import { fmtEntries } from "@/lib/utils/sharlscope/analytics/sharkscope-analytics-format";

const AnalyticsTierPanel = memo(function AnalyticsTierPanel({
  period,
  tierStats,
}: {
  period: SharkscopeAnalyticsPeriod;
  tierStats: TierStat[];
}) {
  const {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    tierOptions,
    barRows,
    uniqueRois,
    uniqueRoiWeighted,
    uniqueProfits,
    uniqueCounts,
    uniquePlayers,
    sort,
    toggleSort,
    sorted,
  } = useTierAnalytics(tierStats);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Consolidado por Tier (ABI médio SharkScope): Low (&lt;$15), Mid ($15–$50), High (&gt;$50). Período:{" "}
        <span className="font-medium text-foreground">{period}</span>.
      </p>
      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-500/20 hover:bg-blue-500/20">
              <TableHead className="min-w-32">
                <div className="flex items-center gap-0.5">
                  <SortButton columnKey="tier" sort={sort} toggleSort={toggleSort} kind="string" label="tier" />
                  <ColumnFilter columnId="tier" label="Tier" options={tierOptions} applied={filters.tier} onApply={setCol("tier")} />
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
              <TableHead>
                <div className="flex items-center gap-0.5">
                  <SortButton columnKey="players" sort={sort} toggleSort={toggleSort} kind="number" label="jogadores" />
                  <NumberRangeFilter label="Jogadores" value={numFilters.players ?? null} onChange={setNumFilter("players")} uniqueValues={uniquePlayers} />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum resultado com os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((s) => (
                <TableRow key={s.tier} className="hover:bg-sidebar-accent/50 bg-white">
                  <TableCell className="font-semibold">{s.tier}</TableCell>
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
                  <TableCell className="text-sm text-muted-foreground">{s.players}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AnalyticsRoiBarChart title="ROI total do time por tier (mesma fórmula ponderada)" rows={barRows} />
    </div>
  );
});

AnalyticsTierPanel.displayName = "AnalyticsTierPanel";
export default AnalyticsTierPanel;
