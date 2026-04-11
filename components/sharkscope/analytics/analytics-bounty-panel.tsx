import { Zap } from "lucide-react";
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
import { AnalyticsRoiBarChart } from "@/components/sharkscope/analytics-roi-bar-chart";
import { SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT } from "@/lib/constants/sharkscope-analytics-labels";
import { distinctOptions } from "@/lib/utils";
import type { SharkscopeAnalyticsPeriod, TypeStat } from "@/lib/types";
import { memo } from "react";
import { useAnalyticsBountyStore } from "@/lib/stores/use-analytics-bounty-store";

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

const AnalyticsBountyPanel = memo(function AnalyticsBountyPanel({
  period,
  hasTypeData,
  typeStats30d,
}: {
  period: SharkscopeAnalyticsPeriod;
  hasTypeData: boolean;
  typeStats30d: TypeStat[];
}) {
  const { filters, setColumnFilter, clearFilters, hasAnyFilter } = useAnalyticsBountyStore();
  const [numFilters, setNumFilters] = useState<Record<string, NumberFilterValue | null>>({});

  const typeOptions = useMemo(
    () =>
      distinctOptions(typeStats30d, (s) => ({
        value: s.type,
        label: SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type],
      })),
    [typeStats30d]
  );

  const filtered = useMemo(
    () =>
      typeStats30d.filter((s) => {
        if (filters.type && !filters.type.has(s.type)) return false;
        if (numFilters.roi && !matchNumberFilter(s.roi, numFilters.roi)) return false;
        if (numFilters.roiWeighted && !matchNumberFilter(s.roiWeighted, numFilters.roiWeighted)) return false;
        if (numFilters.profit && !matchNumberFilter(s.profit, numFilters.profit)) return false;
        if (numFilters.count && !matchNumberFilter(s.count, numFilters.count)) return false;
        return true;
      }),
    [typeStats30d, filters, numFilters]
  );

  const setCol = (col: "type") => (next: Set<string> | null) => {
    setColumnFilter(col, next);
  };

  const setNumFilter = (col: string) => (v: NumberFilterValue | null) => {
    setNumFilters((prev) => ({ ...prev, [col]: v }));
  };

  const typeBarRows = filtered.map((s) => ({
    key: s.type,
    shortLabel: SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type],
    fullLabel: SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type],
    roi: s.roiWeighted,
  }));

  const hasAnyNumFilter = Object.values(numFilters).some(isActive);
  const hasAnyFilterActive = hasAnyFilter || hasAnyNumFilter;

  const handleClearAll = useCallback(() => {
    clearFilters();
    setNumFilters({});
  }, [clearFilters]);

  const uniqueRois = useMemo(() => [...new Set(typeStats30d.map((s) => s.roi).filter((v): v is number => v !== null))], [typeStats30d]);
  const uniqueRoiWeighted = useMemo(() => [...new Set(typeStats30d.map((s) => s.roiWeighted).filter((v): v is number => v !== null))], [typeStats30d]);
  const uniqueProfits = useMemo(() => [...new Set(typeStats30d.map((s) => s.profit).filter((v): v is number => v !== null))], [typeStats30d]);
  const uniqueCounts = useMemo(() => [...new Set(typeStats30d.map((s) => s.count).filter((v): v is number => v !== null))], [typeStats30d]);

  return (
    <div className="space-y-4">
      {period === "90d" && (
        <p className="text-xs text-muted-foreground rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
          Breakdown Bounty / Vanilla / Satélite usa filtros SharkScope na janela de{" "}
          <strong>30 dias</strong> (buscas extras na sincronização). O seletor{" "}
          <strong>90d</strong> acima afeta Por Site, Ranking e Por TIER.
        </p>
      )}
      {!hasTypeData ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-amber-500/10">
          <Zap className="h-10 w-10 mx-auto mb-3 opacity-30 text-amber-500" />
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-500 mb-1">
            Sem dados por tipo de torneo
          </h3>
          <p className="text-xs max-w-lg mx-auto">
            Rode <strong>Sincronizar SharkScope</strong> para buscar estatísticas com filtros Type:B
            (Bounty), Type:SAT (Satélite) e excluindo ambos (Vanilla), além do resumo geral.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-amber-500/15 hover:bg-amber-500/15">
                <TableHead className="min-w-[10rem]">
                  <ColumnFilter
                    columnId="type"
                    label="Tipo"
                    options={typeOptions}
                    applied={filters.type}
                    onApply={setCol("type")}
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
                  <TableRow key={s.type} className="hover:bg-sidebar-accent/50 bg-white">
                    <TableCell className="font-medium">
                      {SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type]}
                    </TableCell>
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
      )}
      {hasTypeData && (
        <AnalyticsRoiBarChart
          title="ROI total por tipo de torneo (30d, filtros SharkScope Type:B / SAT / остальное)"
          rows={typeBarRows}
        />
      )}
    </div>
  );
});

AnalyticsBountyPanel.displayName = "AnalyticsBountyPanel";

export default AnalyticsBountyPanel;
