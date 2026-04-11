import Link from "next/link";
import { Trophy } from "lucide-react";
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
  RankingAbilityBadge,
  RankingFinishPctBadge,
  AnalyticsRoiBadge,
} from "@/components/sharkscope/analytics-cells";
import { distinctOptions } from "@/lib/utils";
import type { RankingEntry, SharkscopeAnalyticsPeriod } from "@/lib/types";
import { memo } from "react";
import { useAnalyticsRankingStore } from "@/lib/stores/use-analytics-ranking-store";

function fmtEntries(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function fmtProfitUsd(n: number | null): string {
  if (n === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtPct(n: number | null, fractionDigits = 1): string {
  if (n === null) return "—";
  return `${n.toFixed(fractionDigits)}%`;
}

function fmtStake(n: number | null): string {
  if (n === null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}

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

const AnalyticsRankingPanel = memo(function AnalyticsRankingPanel({
  ranking,
  period,
}: {
  ranking: RankingEntry[];
  period: SharkscopeAnalyticsPeriod;
}) {
  const { filters, setColumnFilter, clearFilters, hasAnyFilter } = useAnalyticsRankingStore();
  const [numFilters, setNumFilters] = useState<Record<string, NumberFilterValue | null>>({});

  const playerOptions = useMemo(
    () => distinctOptions(ranking, (r) => ({ value: r.player.name, label: r.player.name })),
    [ranking]
  );

  const filtered = useMemo(
    () =>
      ranking.filter((r) => {
        if (filters.player && !filters.player.has(r.player.name)) return false;
        if (numFilters.roi && !matchNumberFilter(r.roi, numFilters.roi)) return false;
        if (numFilters.entries && !matchNumberFilter(r.entries, numFilters.entries)) return false;
        if (numFilters.profit && !matchNumberFilter(r.profit, numFilters.profit)) return false;
        if (numFilters.itm && !matchNumberFilter(r.itm, numFilters.itm)) return false;
        if (numFilters.ability && !matchNumberFilter(r.ability, numFilters.ability)) return false;
        if (numFilters.avStake && !matchNumberFilter(r.avStake, numFilters.avStake)) return false;
        if (numFilters.earlyFinish && !matchNumberFilter(r.earlyFinish, numFilters.earlyFinish)) return false;
        if (numFilters.lateFinish && !matchNumberFilter(r.lateFinish, numFilters.lateFinish)) return false;
        return true;
      }),
    [ranking, filters, numFilters]
  );

  const setCol = (col: "player") => (next: Set<string> | null) => {
    setColumnFilter(col, next);
  };

  const setNumFilter = (col: string) => (v: NumberFilterValue | null) => {
    setNumFilters((prev) => ({ ...prev, [col]: v }));
  };

  const hasAnyNumFilter = Object.values(numFilters).some(isActive);
  const hasAnyFilterActive = hasAnyFilter || hasAnyNumFilter;

  const handleClearAll = useCallback(() => {
    clearFilters();
    setNumFilters({});
  }, [clearFilters]);

  const uniqueRois = useMemo(() => [...new Set(ranking.map((r) => r.roi).filter((v): v is number => v !== null))], [ranking]);
  const uniqueEntries = useMemo(() => [...new Set(ranking.map((r) => r.entries).filter((v): v is number => v !== null))], [ranking]);
  const uniqueProfits = useMemo(() => [...new Set(ranking.map((r) => r.profit).filter((v): v is number => v !== null))], [ranking]);
  const uniqueItms = useMemo(() => [...new Set(ranking.map((r) => r.itm).filter((v): v is number => v !== null))], [ranking]);
  const uniqueAbilities = useMemo(() => [...new Set(ranking.map((r) => r.ability).filter((v): v is number => v !== null))], [ranking]);
  const uniqueStakes = useMemo(() => [...new Set(ranking.map((r) => r.avStake).filter((v): v is number => v !== null))], [ranking]);
  const uniqueEarly = useMemo(() => [...new Set(ranking.map((r) => r.earlyFinish).filter((v): v is number => v !== null))], [ranking]);
  const uniqueLate = useMemo(() => [...new Set(ranking.map((r) => r.lateFinish).filter((v): v is number => v !== null))], [ranking]);

  const thCenter = "whitespace-nowrap text-center align-middle";
  const tdCenter = "text-center align-middle";
  const filterWrap = "flex justify-center w-full min-w-0";

  return (
    <div>
      {ranking.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-blue-500/10">
          <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Sem dados de cache para este período ({period}). Sincronize o SharkScope.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500/20 hover:bg-blue-500/20">
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead className="min-w-[12rem]">
                  <ColumnFilter
                    columnId="player"
                    label="Jogador"
                    options={playerOptions}
                    applied={filters.player}
                    onApply={setCol("player")}
                  />
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <NumberRangeFilter columnId="roi" label={`ROI ${period}`} value={numFilters.roi ?? null} onChange={setNumFilter("roi")} suffix="%" uniqueValues={uniqueRois} />
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <NumberRangeFilter columnId="entries" label="Inscrições" value={numFilters.entries ?? null} onChange={setNumFilter("entries")} uniqueValues={uniqueEntries} />
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <NumberRangeFilter columnId="profit" label="Lucro" value={numFilters.profit ?? null} onChange={setNumFilter("profit")} suffix="$" uniqueValues={uniqueProfits} />
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <NumberRangeFilter columnId="itm" label="ITM %" value={numFilters.itm ?? null} onChange={setNumFilter("itm")} suffix="%" uniqueValues={uniqueItms} />
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <NumberRangeFilter columnId="ability" label="Capacidade" value={numFilters.ability ?? null} onChange={setNumFilter("ability")} uniqueValues={uniqueAbilities} />
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <NumberRangeFilter columnId="avStake" label="Stake méd." value={numFilters.avStake ?? null} onChange={setNumFilter("avStake")} suffix="$" uniqueValues={uniqueStakes} />
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <NumberRangeFilter columnId="earlyFinish" label="Fin. precoce" value={numFilters.earlyFinish ?? null} onChange={setNumFilter("earlyFinish")} suffix="%" uniqueValues={uniqueEarly} />
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <NumberRangeFilter columnId="lateFinish" label="Fin. tardia" value={numFilters.lateFinish ?? null} onChange={setNumFilter("lateFinish")} suffix="%" uniqueValues={uniqueLate} />
                  </div>
                </TableHead>
                <TableHead className="w-[1%] text-center" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                    Nenhum resultado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((entry, i) => (
                  <TableRow key={entry.player.id} className="hover:bg-sidebar-accent/50 bg-white">
                    <TableCell className={`${tdCenter} text-muted-foreground text-sm font-mono`}>
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{entry.player.name}</div>
                      {entry.player.nickname && (
                        <div className="text-xs text-muted-foreground">@{entry.player.nickname}</div>
                      )}
                    </TableCell>
                    <TableCell className={tdCenter}>
                      <div className={filterWrap}>
                        <AnalyticsRoiBadge roi={entry.roi} />
                      </div>
                    </TableCell>
                    <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>
                      {fmtEntries(entry.entries)}
                    </TableCell>
                    <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>
                      {fmtProfitUsd(entry.profit)}
                    </TableCell>
                    <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>
                      {fmtPct(entry.itm)}
                    </TableCell>
                    <TableCell className={tdCenter}>
                      <div className={filterWrap}>
                        <RankingAbilityBadge ability={entry.ability} />
                      </div>
                    </TableCell>
                    <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>
                      {fmtStake(entry.avStake)}
                    </TableCell>
                    <TableCell className={tdCenter}>
                      <div className={filterWrap}>
                        <RankingFinishPctBadge kind="early" pct={entry.earlyFinish} />
                      </div>
                    </TableCell>
                    <TableCell className={tdCenter}>
                      <div className={filterWrap}>
                        <RankingFinishPctBadge kind="late" pct={entry.lateFinish} />
                      </div>
                    </TableCell>
                    <TableCell className={tdCenter}>
                      <Link
                        href={`/dashboard/players/${entry.player.id}`}
                        className="text-xs text-primary hover:underline inline-block"
                      >
                        Ver perfil →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
});

AnalyticsRankingPanel.displayName = "AnalyticsRankingPanel";

export default AnalyticsRankingPanel;
