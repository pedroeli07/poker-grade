"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import NumberRangeFilter from "@/components/number-range-filter";
import { AnalyticsProfitCell, AnalyticsRoiBadge } from "@/components/sharkscope/analytics-cells";
import { AnalyticsRoiBarChart } from "@/components/sharkscope/analytics-roi-bar-chart";
import type { SharkscopeAnalyticsPeriod, TierStat } from "@/lib/types";
import { memo, useCallback, useMemo, useState } from "react";
import { useTierAnalytics } from "@/lib/use-sharkscope-analytics";
import { fmtEntries } from "@/lib/utils/sharkscope-analytics-format";
import { TableColumnSortButton } from "@/components/table-column-sort-button";
import {
  compareNumberNullsLast,
  compareString,
  nextSortState,
  type SortDir,
} from "@/lib/table-sort";

const TIER_ORDER: Record<string, number> = { Low: 0, Mid: 1, High: 2 };

type TierSortKey = "tier" | "roi" | "roiWeighted" | "profit" | "count" | "players";

function compareTier(a: string, b: string, dir: SortDir): number {
  const oa = TIER_ORDER[a] ?? 99;
  const ob = TIER_ORDER[b] ?? 99;
  const d = oa - ob;
  if (d !== 0) return dir === "asc" ? d : -d;
  return compareString(a, b, dir);
}

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
    filtered,
    tierOptions,
    barRows,
    uniqueRois,
    uniqueRoiWeighted,
    uniqueProfits,
    uniqueCounts,
    uniquePlayers,
  } = useTierAnalytics(tierStats);

  const [sort, setSort] = useState<{ key: TierSortKey; dir: SortDir } | null>(null);

  const toggleSort = useCallback((key: TierSortKey, kind: "number" | "string") => {
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const { key, dir } = sort;
    const copy = [...filtered];
    copy.sort((a, b) => {
      switch (key) {
        case "tier":
          return compareTier(a.tier, b.tier, dir);
        case "roi":
          return compareNumberNullsLast(a.roi, b.roi, dir);
        case "roiWeighted":
          return compareNumberNullsLast(a.roiWeighted, b.roiWeighted, dir);
        case "profit":
          return compareNumberNullsLast(a.profit, b.profit, dir);
        case "count":
          return compareNumberNullsLast(a.count, b.count, dir);
        case "players":
          return compareNumberNullsLast(a.players, b.players, dir);
        default:
          return 0;
      }
    });
    return copy;
  }, [filtered, sort]);

  const sortBtn = (key: TierSortKey, kind: "number" | "string", label: string) => {
    const active = sort?.key === key;
    return (
      <TableColumnSortButton
        ariaLabel={`Ordenar por ${label}`}
        isActive={active}
        direction={active ? sort!.dir : null}
        onClick={() => toggleSort(key, kind)}
      />
    );
  };

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
                  {sortBtn("tier", "string", "tier")}
                  <ColumnFilter columnId="tier" label="Tier" options={tierOptions} applied={filters.tier} onApply={setCol("tier")} />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-0.5">
                  {sortBtn("roi", "number", "ROI médio")}
                  <NumberRangeFilter label="Média (ROI)" value={numFilters.roi ?? null} onChange={setNumFilter("roi")} suffix="%" uniqueValues={uniqueRois} />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-0.5">
                  {sortBtn("roiWeighted", "number", "ROI ponderado")}
                  <NumberRangeFilter label="ROI ponds." value={numFilters.roiWeighted ?? null} onChange={setNumFilter("roiWeighted")} suffix="%" uniqueValues={uniqueRoiWeighted} />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-0.5">
                  {sortBtn("profit", "number", "lucro")}
                  <NumberRangeFilter label="Lucro" value={numFilters.profit ?? null} onChange={setNumFilter("profit")} suffix="$" uniqueValues={uniqueProfits} />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-0.5">
                  {sortBtn("count", "number", "volume")}
                  <NumberRangeFilter label="Volume" value={numFilters.count ?? null} onChange={setNumFilter("count")} uniqueValues={uniqueCounts} />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-0.5">
                  {sortBtn("players", "number", "jogadores")}
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
