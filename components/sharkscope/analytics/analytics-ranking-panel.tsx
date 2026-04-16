"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import RankingAbilityBadge from "@/components/sharkscope/analytics/ranking-ability-badge";
import RankingFinishPctBadge from "@/components/sharkscope/analytics/ranking-finish-pct-badge";
import AnalyticsRoiBadge from "@/components/sharkscope/analytics/analytics-roi-badge";
import RankingProfitBadge from "@/components/sharkscope/analytics/ranking-profit-badge";
import SortButton from "@/components/sort-button";
import type { RankingEntry, SharkscopeAnalyticsPeriod } from "@/lib/types";
import { memo } from "react";
import NumberRangeFilter from "@/components/number-range-filter";
import { useRankingAnalytics } from "@/lib/use-sharkscope-analytics";
import { fmtEntries, fmtPct, fmtStake, thCenter, tdCenter, filterWrap } from "@/lib/utils/sharkscope/analytics";

const AnalyticsRankingPanel = memo(function AnalyticsRankingPanel({
  ranking,
  period,
}: {
  ranking: RankingEntry[];
  period: SharkscopeAnalyticsPeriod;
}) {
  const {
    filters,
    numFilters,
    setNumFilter,
    setCol,
    playerOptions,
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
  } = useRankingAnalytics(ranking);

  return (
    <div>
      {ranking.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-blue-500/10">
          <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Sem dados de cache para este período ({period}). Sincronize o SharkScope.</p>
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500/20 hover:bg-blue-500/20">
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead className="min-w-48">
                  <div className="flex items-center gap-0.5">
                    <SortButton columnKey="player" sort={sort} toggleSort={toggleSort} kind="string" label="jogador" />
                    <ColumnFilter columnId="player" label="Jogador" options={playerOptions} applied={filters.player} onApply={setCol("player")} />
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="roi" sort={sort} toggleSort={toggleSort} kind="number" label="ROI total" />
                      <NumberRangeFilter label={`ROI Total`} value={numFilters.roi ?? null} onChange={setNumFilter("roi")} suffix="%" uniqueValues={uniqueRois} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="entries" sort={sort} toggleSort={toggleSort} kind="number" label="inscrições" />
                      <NumberRangeFilter label="Inscrições" value={numFilters.entries ?? null} onChange={setNumFilter("entries")} uniqueValues={uniqueEntries} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="profit" sort={sort} toggleSort={toggleSort} kind="number" label="lucro" />
                      <NumberRangeFilter label="Lucro" value={numFilters.profit ?? null} onChange={setNumFilter("profit")} suffix="$" uniqueValues={uniqueProfits} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="itm" sort={sort} toggleSort={toggleSort} kind="number" label="ITM" />
                      <NumberRangeFilter label="ITM %" value={numFilters.itm ?? null} onChange={setNumFilter("itm")} suffix="%" uniqueValues={uniqueItms} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="ability" sort={sort} toggleSort={toggleSort} kind="number" label="capacidade" />
                      <NumberRangeFilter label="Capacidade" value={numFilters.ability ?? null} onChange={setNumFilter("ability")} uniqueValues={uniqueAbilities} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="avStake" sort={sort} toggleSort={toggleSort} kind="number" label="stake médio" />
                      <NumberRangeFilter label="Stake méd." value={numFilters.avStake ?? null} onChange={setNumFilter("avStake")} suffix="$" uniqueValues={uniqueStakes} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="earlyFinish" sort={sort} toggleSort={toggleSort} kind="number" label="FP" />
                      <NumberRangeFilter label="Finalização precoce " value={numFilters.earlyFinish ?? null} onChange={setNumFilter("earlyFinish")} suffix="%" uniqueValues={uniqueEarly} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      <SortButton columnKey="lateFinish" sort={sort} toggleSort={toggleSort} kind="number" label="FT" />
                      <NumberRangeFilter label="Finalização tardia " value={numFilters.lateFinish ?? null} onChange={setNumFilter("lateFinish")} suffix="%" uniqueValues={uniqueLate} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className="w-[1%] text-center" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                    Nenhum resultado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((entry, i) => (
                  <TableRow key={entry.player.id} className="hover:bg-sidebar-accent/50 bg-white">
                    <TableCell className={`${tdCenter} text-muted-foreground text-sm font-mono`}>{i + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{entry.player.name}</div>
                      {entry.player.nickname && <div className="text-xs text-muted-foreground">@{entry.player.nickname}</div>}
                    </TableCell>
                    <TableCell className={tdCenter}>
                      <div className={filterWrap}>
                        <AnalyticsRoiBadge roi={entry.roi} />
                      </div>
                    </TableCell>
                    <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>{fmtEntries(entry.entries)}</TableCell>
                    <TableCell className={tdCenter}>
                      <div className={filterWrap}>
                        <RankingProfitBadge profit={entry.profit} />
                      </div>
                    </TableCell>
                    <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>{fmtPct(entry.itm)}</TableCell>
                    <TableCell className={tdCenter}>
                      <div className={filterWrap}>
                        <RankingAbilityBadge ability={entry.ability} />
                      </div>
                    </TableCell>
                    <TableCell className={`${tdCenter} text-sm tabular-nums text-muted-foreground`}>{fmtStake(entry.avStake)}</TableCell>
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
                      <Link href={`/dashboard/players/${entry.player.id}`} className="text-xs text-primary hover:underline inline-block">
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
