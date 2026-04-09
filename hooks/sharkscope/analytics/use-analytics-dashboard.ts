"use client";

import { useMemo, useState } from "react";
import { pickSharkscopeStatsByPeriod } from "@/lib/utils";
import type {
  AnalyticsClientProps,
  SharkscopeAnalyticsPeriod,
  SharkscopeAnalyticsTab,
} from "@/lib/types";

export function useAnalyticsDashboard({
  stats30d,
  stats90d,
  ranking,
  tierStats30d,
  typeStats30d,
  hasData30d,
  hasData90d,
}: AnalyticsClientProps) {
  const [period, setPeriod] = useState<SharkscopeAnalyticsPeriod>("30d");
  const [activeTab, setActiveTab] = useState<SharkscopeAnalyticsTab>("site");

  const stats = useMemo(
    () => pickSharkscopeStatsByPeriod(period, stats30d, stats90d),
    [period, stats30d, stats90d]
  );

  const hasData = period === "30d" ? hasData30d : hasData90d;

  return {
    period,
    setPeriod,
    activeTab,
    setActiveTab,
    stats,
    hasData,
    ranking,
    tierStats30d,
    typeStats30d,
  };
}
