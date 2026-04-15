import { SHARKSCOPE_ANALYTICS_PERIODS } from "@/lib/constants";
import { sharkscopeAnalyticsPageMetadata } from "@/lib/constants/metadata";
import { SyncSharkScopeButton } from "@/components/sharkscope/sync-button";
import type { SharkscopeAnalyticsPeriod } from "@/lib/types";
import { memo } from "react";

const AnalyticsPageHeader = memo(function AnalyticsPageHeader({
  period,
  setPeriod,
}: {
  period: SharkscopeAnalyticsPeriod;
  setPeriod: (p: SharkscopeAnalyticsPeriod) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">
          {sharkscopeAnalyticsPageMetadata.title}
        </h2>
        <p className="text-muted-foreground mt-1">{sharkscopeAnalyticsPageMetadata.description}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <SyncSharkScopeButton syncMode="analytics" />
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
    </div>
  );
});

AnalyticsPageHeader.displayName = "AnalyticsPageHeader";

export default AnalyticsPageHeader;
