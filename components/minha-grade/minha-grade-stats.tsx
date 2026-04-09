import Link from "next/link";
import { Target, AlertTriangle, CheckCircle2, CircleSlash, Repeat2 } from "lucide-react";

export function MinhaGradeStats({
  targetsCount,
  tourneyStats,
  pendingExtraReviews,
}: {
  targetsCount: number;
  tourneyStats: { played: number; extraPlay: number; didntPlay: number; reentries: number };
  pendingExtraReviews: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-3">
          Resumo
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Link
          href="#meus-targets"
          className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4 transition-colors hover:bg-primary/[0.05] hover:border-primary/25"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <Target className="h-4 w-4 shrink-0" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Targets
            </span>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {targetsCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">ativos</p>
        </Link>
        <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Extra plays
            </span>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {tourneyStats.extraPlay}
          </p>
          {pendingExtraReviews > 0 ? (
            <p className="text-[11px] text-primary/80 mt-1">
              {pendingExtraReviews} conferência
              {pendingExtraReviews !== 1 ? "ões" : ""} pendente
              {pendingExtraReviews !== 1 ? "s" : ""}
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground mt-1">
              Lobbyize: extra play
            </p>
          )}
        </div>
        <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Torneios jogados
            </span>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {tourneyStats.played}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Played</p>
        </div>
        <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <CircleSlash className="h-4 w-4 shrink-0" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Não jogados
            </span>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {tourneyStats.didntPlay}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Didn&apos;t play
          </p>
        </div>
        <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4 col-span-2 sm:col-span-1 lg:col-span-1">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Repeat2 className="h-4 w-4 shrink-0" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Reentradas
            </span>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {tourneyStats.reentries}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Torneios com rebuy
          </p>
        </div>
      </div>
    </div>
  );
}
