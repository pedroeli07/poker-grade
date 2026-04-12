"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import { RankingAbilityBadge, RankingFinishPctBadge, AnalyticsRoiBadge, RankingProfitBadge } from "@/components/sharkscope/analytics-cells";
import type { RankingEntry, SharkscopeAnalyticsPeriod } from "@/lib/types";
import { memo, useCallback, useMemo, useState } from "react";
import NumberRangeFilter from "@/components/number-range-filter";
import { useRankingAnalytics } from "@/lib/use-sharkscope-analytics";
import { fmtEntries, fmtPct, fmtStake, thCenter, tdCenter, filterWrap } from "@/lib/utils/sharkscope-analytics-format";
import { TableColumnSortButton } from "@/components/table-column-sort-button";
import {
  compareNumber,
  compareNumberNullsLast,
  compareString,
  nextSortState,
  type SortDir,
} from "@/lib/table-sort";

type RankingSortKey =
  | "player"
  | "roi"
  | "entries"
  | "profit"
  | "itm"
  | "ability"
  | "avStake"
  | "earlyFinish"
  | "lateFinish";

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
    filtered,
    playerOptions,
    uniqueRois,
    uniqueEntries,
    uniqueProfits,
    uniqueItms,
    uniqueAbilities,
    uniqueStakes,
    uniqueEarly,
    uniqueLate,
  } = useRankingAnalytics(ranking);

  const [sort, setSort] = useState<{ key: RankingSortKey; dir: SortDir } | null>(null);

  const toggleSort = useCallback((key: RankingSortKey, kind: "number" | "string") => {
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const { key, dir } = sort;
    const copy = [...filtered];
    copy.sort((a, b) => {
      switch (key) {
        case "player":
          return compareString(a.player.name, b.player.name, dir);
        case "roi":
          return compareNumber(a.roi, b.roi, dir);
        case "entries":
          return compareNumberNullsLast(a.entries, b.entries, dir);
        case "profit":
          return compareNumberNullsLast(a.profit, b.profit, dir);
        case "itm":
          return compareNumberNullsLast(a.itm, b.itm, dir);
        case "ability":
          return compareNumberNullsLast(a.ability, b.ability, dir);
        case "avStake":
          return compareNumberNullsLast(a.avStake, b.avStake, dir);
        case "earlyFinish":
          return compareNumberNullsLast(a.earlyFinish, b.earlyFinish, dir);
        case "lateFinish":
          return compareNumberNullsLast(a.lateFinish, b.lateFinish, dir);
        default:
          return 0;
      }
    });
    return copy;
  }, [filtered, sort]);

  const sortBtn = (key: RankingSortKey, kind: "number" | "string", label: string) => {
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
                    {sortBtn("player", "string", "jogador")}
                    <ColumnFilter columnId="player" label="Jogador" options={playerOptions} applied={filters.player} onApply={setCol("player")} />
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      {sortBtn("roi", "number", "ROI")}
                      <NumberRangeFilter label={`ROI ${period}`} value={numFilters.roi ?? null} onChange={setNumFilter("roi")} suffix="%" uniqueValues={uniqueRois} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      {sortBtn("entries", "number", "inscrições")}
                      <NumberRangeFilter label="Inscrições" value={numFilters.entries ?? null} onChange={setNumFilter("entries")} uniqueValues={uniqueEntries} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      {sortBtn("profit", "number", "lucro")}
                      <NumberRangeFilter label="Lucro" value={numFilters.profit ?? null} onChange={setNumFilter("profit")} suffix="$" uniqueValues={uniqueProfits} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      {sortBtn("itm", "number", "ITM")}
                      <NumberRangeFilter label="ITM %" value={numFilters.itm ?? null} onChange={setNumFilter("itm")} suffix="%" uniqueValues={uniqueItms} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      {sortBtn("ability", "number", "capacidade")}
                      <NumberRangeFilter label="Capacidade" value={numFilters.ability ?? null} onChange={setNumFilter("ability")} uniqueValues={uniqueAbilities} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      {sortBtn("avStake", "number", "stake médio")}
                      <NumberRangeFilter label="Stake méd." value={numFilters.avStake ?? null} onChange={setNumFilter("avStake")} suffix="$" uniqueValues={uniqueStakes} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      {sortBtn("earlyFinish", "number", "finalização precoce")}
                      <NumberRangeFilter label="Fin. precoce" value={numFilters.earlyFinish ?? null} onChange={setNumFilter("earlyFinish")} suffix="%" uniqueValues={uniqueEarly} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className={thCenter}>
                  <div className={filterWrap}>
                    <div className="inline-flex items-center gap-0.5 justify-center">
                      {sortBtn("lateFinish", "number", "finalização tardia")}
                      <NumberRangeFilter label="Fin. tardia" value={numFilters.lateFinish ?? null} onChange={setNumFilter("lateFinish")} suffix="%" uniqueValues={uniqueLate} />
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
