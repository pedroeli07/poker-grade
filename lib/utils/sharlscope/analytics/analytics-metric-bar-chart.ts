import { ANALYTICS_METRIC_BAR_SITE_FILLS } from "@/lib/constants/sharkscope/analytics/analytics-metric-bar-chart";
import type { SiteChartYMetric } from "@/lib/site-analytics-chart";
import { analyticsBarRoiFillByPercent } from "@/lib/utils/sharlscope/analytics/analytics-bar-roi-fill";

export function metricBarFillForCell(metric: SiteChartYMetric, v: number, key: string): string {
  const siteColor = ANALYTICS_METRIC_BAR_SITE_FILLS[key.toLowerCase()];
  if (siteColor) return siteColor;

  if (metric === "roi") return analyticsBarRoiFillByPercent(v);
  if (metric === "profit") return v >= 0 ? "#16a34a" : "#dc2626";
  return "#3b82f6";
}

export function metricBarYAxisDomain(
  metric: SiteChartYMetric,
  values: number[]
): { domainMin: number; domainMax: number } {
  const minV = values.length ? Math.min(...values) : 0;
  const maxV = values.length ? Math.max(...values) : 1;
  const span = maxV - minV || 1;
  const pad = Math.max(
    Math.abs(span) * 0.1,
    metric === "profit" ? Math.abs(maxV) * 0.05 : metric === "entries" ? Math.max(1, maxV * 0.05) : 2
  );
  const isPctAxis =
    metric === "roi" || metric === "itm" || metric === "earlyFinish" || metric === "lateFinish";
  const domainMin = isPctAxis
    ? Math.min(0, minV) - pad
    : metric === "entries"
      ? Math.max(0, minV - pad)
      : minV - pad;
  const domainMax = maxV + pad;
  return { domainMin, domainMax };
}
