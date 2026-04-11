import { useMemo, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import NumberRangeFilter, { isActive, type NumberFilterValue } from "@/components/number-range-filter";
import {
  AnalyticsProfitCell,
  AnalyticsRoiBadge,
} from "@/components/sharkscope/analytics-cells";
import { AnalyticsRoiBarChart, type AnalyticsRoiBarRow } from "@/components/sharkscope/analytics-roi-bar-chart";
import { distinctOptions } from "@/lib/utils";
import type { SharkscopeAnalyticsPeriod, TierStat } from "@/lib/types";
import { memo } from "react";
import { useAnalyticsTierStore } from "@/lib/stores/use-analytics-tier-store";

function matchNumberFilter(v: number | null, f: NumberFilterValue | null): boolean {
  if (!f) return true;
  if (v === null) return false;
  if (f.op === "in" && f.values && f.values.length > 0) {
    return f.values.includes(v);
  }
  if (f.op === "eq" && v === f.min) return true;
  if (f.op === "gt" && v > (f.min ?? 0)) return true;
  if (f.op === "lt" && v < (f.min ?? 0)) return true;
  if (f.op === "gte" && v >= (f.min ?? 0)) return true;
  if (f.op === "lte" && v <= (f.min ?? 0)) return true;
  if (f.op === "between" && f.min !== null && f.max !== null && v >= f.min && v <= f.max) return true;
  if (f.op === "between" && f.min !== null && f.max === null && v >= f.min) return true;
  if (f.op === "between" && f.min === null && f.max !== null && v <= f.max) return true;
  return false;
}

const AnalyticsTierPanel = memo(function AnalyticsTierPanel({
  period,
  tierStats,
  tierBarRows,
}: {
  period: SharkscopeAnalyticsPeriod;
  tierStats: TierStat[];
  tierBarRows: AnalyticsRoiBarRow[];
}) {
  const { filters, setColumnFilter, clearFilters, hasAnyFilter } = useAnalyticsTierStore();
  const [numFilters, setNumFilters] = useState<Record<string, NumberFilterValue | null>>({});

  const tierOptions = useMemo(
    () => distinctOptions(tierStats, (s) => ({ value: s.tier, label: s.tier })),
    [tierStats]
  );

  const filtered = useMemo(
    () =>
      tierStats.filter((s) => {
        if (filters.tier && !filters.tier.has(s.tier)) return false;
        if (numFilters.roi && !matchNumberFilter(s.roi, numFilters.roi)) return false;
        if (numFilters.roiWeighted && !matchNumberFilter(s.roiWeighted, numFilters.roiWeighted)) return false;
        if (numFilters.profit && !matchNumberFilter(s.profit, numFilters.profit)) return false;
        if (numFilters.count && !matchNumberFilter(s.count, numFilters.count)) return false;
        if (numFilters.players && !matchNumberFilter(s.players, numFilters.players)) return false;
        return true;
      }),
    [tierStats, filters, numFilters]
  );

  const setCol = (col: "tier") => (next: Set<string> | null) => {
    setColumnFilter(col, next);
  };

  const setNumFilter = (col: string) => (v: NumberFilterValue | null) => {
    setNumFilters((prev) => ({ ...prev, [col]: v }));
  };

  const filteredBarRows = useMemo(
    () =>
      filtered.map((s) => ({
        key: s.tier,
        shortLabel: s.tier,
        fullLabel: `Tier ${s.tier} (Low / Mid / High)`,
        roi: s.roiWeighted,
      })),
    [filtered]
  );

  const hasAnyNumFilter = Object.values(numFilters).some(isActive);
  const hasAnyFilterActive = hasAnyFilter || hasAnyNumFilter;

  const handleClearAll = useCallback(() => {
    clearFilters();
    setNumFilters({});
  }, [clearFilters]);

  const uniqueRois = useMemo(() => [...new Set(tierStats.map((s) => s.roi).filter((v): v is number => v !== null))], [tierStats]);
  const uniqueRoiWeighted = useMemo(() => [...new Set(tierStats.map((s) => s.roiWeighted).filter((v): v is number => v !== null))], [tierStats]);
  const uniqueProfits = useMemo(() => [...new Set(tierStats.map((s) => s.profit).filter((v): v is number => v !== null))], [tierStats]);
  const uniqueCounts = useMemo(() => [...new Set(tierStats.map((s) => s.count).filter((v): v is number => v !== null))], [tierStats]);
  const uniquePlayers = useMemo(() => [...new Set(tierStats.map((s) => s.players).filter((v): v is number => v !== null))], [tierStats]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Consolidado por Tier (ABI médio SharkScope): Low (&lt;$15), Mid ($15–$50), High (&gt;$50).
        Período: <span className="font-medium text-foreground">{period}</span>.
      </p>
      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-500/20 hover:bg-blue-500/20">
              <TableHead className="min-w-[8rem]">
                <ColumnFilter
                  columnId="tier"
                  label="Tier"
                  options={tierOptions}
                  applied={filters.tier}
                  onApply={setCol("tier")}
                />
              </TableHead>
              <TableHead>
                <NumberRangeFilter columnId="roi" label="Média (ROI)" value={numFilters.roi ?? null} onChange={setNumFilter("roi")} suffix="%" uniqueValues={uniqueRois} />
              </TableHead>
              <TableHead>
                <NumberRangeFilter columnId="roiWeighted" label="ROI ponds." value={numFilters.roiWeighted ?? null} onChange={setNumFilter("roiWeighted")} suffix="%" uniqueValues={uniqueRoiWeighted} />
              </TableHead>
              <TableHead>
                <NumberRangeFilter columnId="profit" label="Lucro" value={numFilters.profit ?? null} onChange={setNumFilter("profit")} suffix="$" uniqueValues={uniqueProfits} />
              </TableHead>
              <TableHead>
                <NumberRangeFilter columnId="count" label="Volume" value={numFilters.count ?? null} onChange={setNumFilter("count")} uniqueValues={uniqueCounts} />
              </TableHead>
              <TableHead>
                <NumberRangeFilter columnId="players" label="Jogadores" value={numFilters.players ?? null} onChange={setNumFilter("players")} uniqueValues={uniquePlayers} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum resultado com os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
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
                  <TableCell className="text-sm text-muted-foreground">
                    {s.count !== null ? s.count.toFixed(0) : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.players}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AnalyticsRoiBarChart
        title="ROI total do time por tier (mesma fórmula ponderada)"
        rows={filteredBarRows}
      />
    </div>
  );
});

AnalyticsTierPanel.displayName = "AnalyticsTierPanel";

export default AnalyticsTierPanel;
