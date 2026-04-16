import type { HistoryPageData } from "@/lib/data/history";
import HistoryPageHeader from "@/components/history/history-page-header";
import HistorySummaryCards from "@/components/history/history-summary-cards";
import HistoryTimeline from "@/components/history/history-timeline";
import { memo } from "react";

const HistoryPageView = memo(function HistoryPageView({ history, upgrades, downgrades }: HistoryPageData) {
  return (
    <div className="space-y-6">
      <HistoryPageHeader />
      <HistorySummaryCards
        upgrades={upgrades}
        downgrades={downgrades}
        totalRecords={history.length}
      />
      <HistoryTimeline history={history} />
    </div>
  );
});

HistoryPageView.displayName = "HistoryPageView";

export default HistoryPageView;
