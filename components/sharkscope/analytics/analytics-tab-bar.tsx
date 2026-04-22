import { SHARKSCOPE_ANALYTICS_TAB_LABELS, TAB_ICONS, TAB_IDS } from "@/lib/constants/sharkscope/analytics";
import type { SharkscopeAnalyticsPeriod, SharkscopeAnalyticsTab } from "@/lib/types/sharkscope/analytics/index";
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
            className={`shadow-md shadow-blue-500/30 rounded-lg cursor-pointer flex 
              items-center gap-2 px-4 py-2.5 text-sm 
              font-medium border-b-2 transition-colors hover:shadow-lg
              ${activeTab === id
                ? "bg-blue-600/25 text-blue-900 border-b-blue-600 shadow-blue-600/25 hover:bg-blue-600/30 dark:bg-blue-500/30 dark:text-blue-100 dark:border-b-blue-400"
                : "bg-blue-500/10 hover:bg-blue-500/20 border-transparent text-muted-foreground hover:text-foreground"
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
