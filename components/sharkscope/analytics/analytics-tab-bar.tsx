import { SHARKSCOPE_ANALYTICS_TAB_LABELS, TAB_ICONS, TAB_IDS } from "@/lib/constants/sharkscope/analytics/sharkscope-analytics-labels";
import type { SharkscopeAnalyticsPeriod, SharkscopeAnalyticsTab } from "@/lib/types";
import { memo } from "react";

const AnalyticsTabBar = memo(function AnalyticsTabBar({
  activeTab,
  setActiveTab,
  period,
}: {
  activeTab: SharkscopeAnalyticsTab;
  setActiveTab: (t: SharkscopeAnalyticsTab) => void;
  period: SharkscopeAnalyticsPeriod;
}) {
  return (
    <div className="flex gap-1 border-b border-border/60">
      {TAB_IDS.map((id) => {
        const Icon = TAB_ICONS[id];
        const label =
          id === "ranking"
            ? `${SHARKSCOPE_ANALYTICS_TAB_LABELS[id]} (${period})`
            : SHARKSCOPE_ANALYTICS_TAB_LABELS[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
});

AnalyticsTabBar.displayName = "AnalyticsTabBar";

export default AnalyticsTabBar;
