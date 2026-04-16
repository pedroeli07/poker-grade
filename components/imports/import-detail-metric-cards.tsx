import Link from "next/link";
import type { ImportDetailTabWithCount, Tab } from "@/lib/types";
import { memo } from "react";
import { IMPORT_DETAIL_CARD_INACTIVE_CLS } from "@/lib/constants";

const ImportDetailMetricCards = memo(function ImportDetailMetricCards({
  importId,
  tabs,
  activeTab,
}: {
  importId: string;
  tabs: ImportDetailTabWithCount[];
  activeTab: Tab;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={`/dashboard/imports/${importId}?tab=${tab.id}`}
            className={`group rounded-xl border p-5 transition-all hover:scale-[1.02] ${
              isActive ? tab.cardActiveClass : IMPORT_DETAIL_CARD_INACTIVE_CLS
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className={`h-5 w-5 ${tab.iconClass}`} />
              {tab.count > 0 && (
                <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${tab.countCls}`}>
                  {tab.count}
                </span>
              )}
            </div>
            <div className={`text-4xl font-bold tabular-nums ${tab.countNumberClass}`}>{tab.count}</div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">{tab.label}</div>
          </Link>
        );
      })}
    </div>
  );
});

ImportDetailMetricCards.displayName = "ImportDetailMetricCards";

export default ImportDetailMetricCards;
