"use client";

import { memo } from "react";
import PlayerRoiCell from "@/components/players/table/player-roi-cell";
import { earlyFinishSeverity, lateFinishSeverity } from "@/lib/sharkscope-parse";
import { fmtProfitUsd } from "@/lib/utils/sharkscope-analytics-format";

const pillClass =
  "inline-flex flex-row items-center gap-1.5 tabular-nums px-2.5 py-1 rounded-md border text-xs font-bold";

function severityStyle(sev: "red" | "yellow" | "green") {
  if (sev === "red") return `${pillClass} bg-red-500/10 text-red-600 border-red-500/20`;
  if (sev === "yellow") return `${pillClass} bg-amber-500/10 text-amber-600 border-amber-500/20`;
  return `${pillClass} bg-muted text-muted-foreground border-border/50`;
}

/** Mesmas faixas visuais da tabela de jogadores (`PlayerRoiCell`). */
export const AnalyticsRoiBadge = memo(function AnalyticsRoiBadge({
  roi,
}: {
  roi: number | null;
}) {
  return <PlayerRoiCell roi={roi} />;
});

/** Finalização precoce / tardia — mesmos limiares dos alertas (`earlyFinishSeverity` / `lateFinishSeverity`). */
export const RankingFinishPctBadge = memo(function RankingFinishPctBadge({
  kind,
  pct,
}: {
  kind: "early" | "late";
  pct: number | null;
}) {
  if (pct === null) return <span className="text-muted-foreground text-xs">—</span>;
  const sev = kind === "early" ? earlyFinishSeverity(pct) : lateFinishSeverity(pct);
  const label = `${pct.toFixed(1)}%`;
  return <span className={severityStyle(sev)}>{label}</span>;
});

/** Capacidade (0–100): maior é melhor. */
export const RankingAbilityBadge = memo(function RankingAbilityBadge({
  ability,
}: {
  ability: number | null;
}) {
  if (ability === null) return <span className="text-muted-foreground text-xs">—</span>;
  const n = Math.round(ability);
  if (n < 40) return <span className={`${pillClass} bg-red-500/10 text-red-600 border-red-500/20`}>{n}</span>;
  if (n < 60) return <span className={`${pillClass} bg-amber-500/10 text-amber-600 border-amber-500/20`}>{n}</span>;
  if (n < 80) return <span className={`${pillClass} bg-emerald-500/10 text-emerald-700 border-emerald-500/25`}>{n}</span>;
  return <span className={`${pillClass} bg-emerald-500/15 text-emerald-700 border-emerald-500/30`}>{n}</span>;
});

export const AnalyticsProfitCell = memo(function AnalyticsProfitCell({
  profit,
}: {
  profit: number | null;
}) {
  if (profit === null)
    return <span className="text-muted-foreground text-xs">—</span>;
  const sign = profit >= 0 ? "+" : "";
  return (
    <span
      className={`font-mono text-sm font-semibold ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}
    >
      {sign}${profit.toFixed(0)}
    </span>
  );
});

/** Lucro em badge verde / vermelho (ex.: ranking SharkScope). */
export const RankingProfitBadge = memo(function RankingProfitBadge({
  profit,
}: {
  profit: number | null;
}) {
  if (profit === null)
    return <span className="text-muted-foreground text-xs">—</span>;
  const label = fmtProfitUsd(profit);
  if (profit >= 0) {
    return (
      <span
        className={`${pillClass} bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-400`}
      >
        {label}
      </span>
    );
  }
  return (
    <span className={`${pillClass} bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400`}>
      {label}
    </span>
  );
});
