"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  SHARKSCOPE_ANALYTICS_LS_PERIOD,
  SHARKSCOPE_ANALYTICS_LS_TAB,
} from "@/lib/constants/sharkscope/analytics";
import { pickSharkscopeStatsByPeriod } from "@/lib/utils/sharkscope-extract";
import type { AnalyticsClientProps, SharkscopeAnalyticsPeriod, SharkscopeAnalyticsTab } from "@/lib/types/sharkscope/analytics/index";
const PERIODS: SharkscopeAnalyticsPeriod[] = ["30d", "90d"];
const TABS: SharkscopeAnalyticsTab[] = ["site", "ranking", "tier", "bounty"];

function isPeriod(v: string): v is SharkscopeAnalyticsPeriod {
  return PERIODS.includes(v as SharkscopeAnalyticsPeriod);
}

function isTab(v: string): v is SharkscopeAnalyticsTab {
  return TABS.includes(v as SharkscopeAnalyticsTab);
}

export function useAnalyticsPageClient({
  stats30d,
  stats90d,
  siteAnalytics30d,
  siteAnalytics90d,
  ranking30d,
  ranking90d,
  tierStats30d,
  tierStats90d,
  typeStats30d,
  typeStats90d,
  hasData30d,
  hasData90d,
}: AnalyticsClientProps) {
  const [period, setPeriodState] = useState<SharkscopeAnalyticsPeriod>("30d");
  const [activeTab, setActiveTabState] = useState<SharkscopeAnalyticsTab>("site");
  const [storageHydrated, setStorageHydrated] = useState(false);

  useLayoutEffect(() => {
    try {
      const p = localStorage.getItem(SHARKSCOPE_ANALYTICS_LS_PERIOD);
      if (p && isPeriod(p)) setPeriodState(p);
      const t = localStorage.getItem(SHARKSCOPE_ANALYTICS_LS_TAB);
      if (t && isTab(t)) setActiveTabState(t);
    } catch {
      /* ignore */
    } finally {
      setStorageHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(SHARKSCOPE_ANALYTICS_LS_PERIOD, period);
    } catch {
      /* ignore */
    }
  }, [period, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(SHARKSCOPE_ANALYTICS_LS_TAB, activeTab);
    } catch {
      /* ignore */
    }
  }, [activeTab, storageHydrated]);

  const setPeriod = useCallback((p: SharkscopeAnalyticsPeriod) => {
    setPeriodState(p);
  }, []);

  const setActiveTab = useCallback((t: SharkscopeAnalyticsTab) => {
    setActiveTabState(t);
  }, []);

  const stats = useMemo(
    () => pickSharkscopeStatsByPeriod(period, stats30d, stats90d),
    [period, stats30d, stats90d]
  );

  const siteAnalytics = useMemo(
    () => (period === "30d" ? siteAnalytics30d : siteAnalytics90d),
    [period, siteAnalytics30d, siteAnalytics90d]
  );

  const hasData = period === "30d" ? hasData30d : hasData90d;

  const ranking = useMemo(
    () => (period === "30d" ? ranking30d : ranking90d),
    [period, ranking30d, ranking90d]
  );

  const tierStats = useMemo(
    () => (period === "30d" ? tierStats30d : tierStats90d),
    [period, tierStats30d, tierStats90d]
  );

  const typeStats = useMemo(
    () => (period === "30d" ? typeStats30d : typeStats90d),
    [period, typeStats30d, typeStats90d]
  );

  const hasTypeData = useMemo(
    () =>
      typeStats.some(
        (s) =>
          s.roi !== null ||
          s.roiWeighted !== null ||
          s.profit !== null ||
          (s.entries !== null && s.entries > 0)
      ),
    [typeStats]
  );

  const tierBarRows = useMemo(
    () =>
      tierStats.map((s) => ({
        key: s.tier,
        shortLabel: s.label,
        fullLabel: s.label,
        roi: s.roiWeighted,
      })),
    [tierStats]
  );

  return {
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
    tierBarRows,
  };
}
