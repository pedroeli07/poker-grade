import Link from "next/link";
import type { Tab } from "@/lib/types";
import type { ImportDetailTabWithCount } from "@/lib/imports/import-detail-tabs";
import { memo } from "react";

const ImportDetailTabNav = memo(function ImportDetailTabNav({
  importId,
  tabs,
  activeTab,
}: {
  importId: string;
  tabs: ImportDetailTabWithCount[];
  activeTab: Tab;
}) {
  return (
    <div className="flex gap-2 border-b border-border overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={`/dashboard/imports/${importId}?tab=${tab.id}`}
            className={`flex items-center gap-2 px-5 py-3 text-[15px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              isActive
                ? tab.activeCls
                : tab.inactiveCls + " hover:text-foreground/80"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${tab.countCls}`}>
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
});

ImportDetailTabNav.displayName = "ImportDetailTabNav";

export default ImportDetailTabNav;
