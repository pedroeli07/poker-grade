import { BarChart3 } from "lucide-react";
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
import type { NetworkStat } from "@/lib/types";
import { memo } from "react";
import { useAnalyticsSiteStore } from "@/lib/stores/use-analytics-site-store";

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

const AnalyticsSitePanel = memo(function AnalyticsSitePanel({
  hasData,
  stats,
  siteBarRows,
}: {
  hasData: boolean;
  stats: NetworkStat[];
  siteBarRows: AnalyticsRoiBarRow[];
}) {
  const { filters, setColumnFilter, clearFilters, hasAnyFilter } = useAnalyticsSiteStore();
  const [numFilters, setNumFilters] = useState<Record<string, NumberFilterValue | null>>({});

  const networkOptions = useMemo(
    () => distinctOptions(stats, (s) => ({ value: s.network, label: s.label })),
    [stats]
  );

  const filtered = useMemo(
    () =>
      stats.filter((s) => {
        if (filters.network && !filters.network.has(s.network)) return false;
        if (numFilters.roi && !matchNumberFilter(s.roi, numFilters.roi)) return false;
        if (numFilters.roiWeighted && !matchNumberFilter(s.roiWeighted, numFilters.roiWeighted)) return false;
        if (numFilters.profit && !matchNumberFilter(s.profit, numFilters.profit)) return false;
        if (numFilters.count && !matchNumberFilter(s.count, numFilters.count)) return false;
        return true;
      }),
    [stats, filters, numFilters]
  );

  const setCol = (col: "network") => (next: Set<string> | null) => {
    setColumnFilter(col, next);
  };

  const setNumFilter = (col: string) => (v: NumberFilterValue | null) => {
    setNumFilters((prev) => ({ ...prev, [col]: v }));
  };

  const filteredBarRows = useMemo(
    () =>
      filtered.map((s) => ({
        key: s.network,
        shortLabel: s.label.length > 16 ? `${s.label.slice(0, 14)}…` : s.label,
        fullLabel: s.label,
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

  const uniqueRois = useMemo(() => [...new Set(stats.map((s) => s.roi).filter((v): v is number => v !== null))], [stats]);
  const uniqueRoiWeighted = useMemo(() => [...new Set(stats.map((s) => s.roiWeighted).filter((v): v is number => v !== null))], [stats]);
  const uniqueProfits = useMemo(() => [...new Set(stats.map((s) => s.profit).filter((v): v is number => v !== null))], [stats]);
  const uniqueCounts = useMemo(() => [...new Set(stats.map((s) => s.count).filter((v): v is number => v !== null))], [stats]);

  return (
    <div>
      {!hasData ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-blue-500/10 px-4">
          <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-foreground">Sem estatísticas por rede no cache</p>
          <p className="text-xs mt-2 max-w-xl mx-auto leading-relaxed">
            Cadastre <strong>nicks SharkScope por rede</strong> (GGPoker, PokerStars, etc.) em cada
            jogador e rode <strong>Sincronizar SharkScope</strong>. O <em>player group</em> alimenta
            Ranking e Por TIER; esta aba consolida só redes reais (um barra por site).
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-500/10 hover:bg-transparent">
                  <TableHead className="min-w-[10rem]">
                    <ColumnFilter
                      columnId="network"
                      label="Rede"
                      options={networkOptions}
                      applied={filters.network}
                      onApply={setCol("network")}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhum resultado com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s.network} className="hover:bg-sidebar-accent/50">
                      <TableCell className="font-medium">{s.label}</TableCell>
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <AnalyticsRoiBarChart
            title="ROI total do time por rede (Σ ROI×torneios / Σ torneios) — eixo Y em %"
            rows={filteredBarRows}
          />
        </>
      )}
    </div>
  );
});

AnalyticsSitePanel.displayName = "AnalyticsSitePanel";

export default AnalyticsSitePanel;
