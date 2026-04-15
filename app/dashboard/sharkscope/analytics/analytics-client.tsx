"use client";

import { memo } from "react";
import { useAnalyticsPageClient } from "@/hooks/sharkscope/analytics/use-analytics-page-client";
import type { AnalyticsClientProps } from "@/lib/types";
import AnalyticsPageHeader from "@/components/sharkscope/analytics/analytics-page-header";
import AnalyticsTabBar from "@/components/sharkscope/analytics/analytics-tab-bar";
import AnalyticsSitePanel from "@/components/sharkscope/analytics/analytics-site-panel";
import AnalyticsRankingPanel from "@/components/sharkscope/analytics/analytics-ranking-panel";
import AnalyticsTierPanel from "@/components/sharkscope/analytics/analytics-tier-panel";
import AnalyticsBountyPanel from "@/components/sharkscope/analytics/analytics-bounty-panel";
import AnalyticsAboutCard from "@/components/sharkscope/analytics/analytics-about-card";

const AnalyticsClient = memo(function AnalyticsClient(props: AnalyticsClientProps) {
  const {
    period,
    setPeriod,
    activeTab,
    setActiveTab,
    stats,
    siteAnalytics,
    hasData,
    ranking,
    tierStats,
    typeStats,
    hasTypeData,
  } = useAnalyticsPageClient(props);

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader period={period} setPeriod={setPeriod} />
      <AnalyticsTabBar activeTab={activeTab} setActiveTab={setActiveTab} period={period} />

      {activeTab === "site" && (
        <AnalyticsSitePanel hasData={hasData} stats={stats} siteAnalytics={siteAnalytics} period={period} />
      )}

      {activeTab === "ranking" && <AnalyticsRankingPanel ranking={ranking} period={period} />}

      {activeTab === "tier" && (
        <AnalyticsTierPanel period={period} tierStats={tierStats} />
      )}

      {activeTab === "bounty" && (
        <AnalyticsBountyPanel period={period} hasTypeData={hasTypeData} typeStats={typeStats} />
      )}

      <AnalyticsAboutCard />
    </div>
  );
});

AnalyticsClient.displayName = "AnalyticsClient";

export default AnalyticsClient;
