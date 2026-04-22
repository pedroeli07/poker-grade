"use client";

import { SHARKSCOPE_ANALYTICS_PERIODS } from "@/lib/constants/sharkscope/analytics";
import type { SharkscopeAnalyticsPeriod } from "@/lib/types/sharkscope/analytics/index";
import { memo } from "react";

const AnalyticsDebugPageHeader = memo(function AnalyticsDebugPageHeader({
  period,
  setPeriod,
}: {
  period: SharkscopeAnalyticsPeriod;
  setPeriod: (p: SharkscopeAnalyticsPeriod) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Analytics (debug)</h2>
        <p className="text-muted-foreground mt-1">
          Mesmas abas que Analytics (Por site, Ranking, Tier, Bounty/Vanilla/Sat), filtradas a um jogador — compare com a
          pesquisa manual no SharkScope antes de sincronizar o time inteiro.
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1 bg-muted/30 w-fit">
        {SHARKSCOPE_ANALYTICS_PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`cursor-pointer px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
              period === p
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
});

AnalyticsDebugPageHeader.displayName = "AnalyticsDebugPageHeader";

export default AnalyticsDebugPageHeader;
