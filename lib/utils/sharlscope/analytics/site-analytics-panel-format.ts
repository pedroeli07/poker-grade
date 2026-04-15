import type { SiteChartYMetric } from "@/lib/site-analytics-chart";

const pctFmt = (v: number) => `${v.toFixed(1)}%`;
const profitFmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const entriesFmt = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

export function siteChartFormattersForMetric(metric: SiteChartYMetric) {
  if (metric === "profit") {
    return { tickFormatter: profitFmt, tooltipFormatter: profitFmt };
  }
  if (metric === "entries") {
    return { tickFormatter: entriesFmt, tooltipFormatter: entriesFmt };
  }
  return { tickFormatter: pctFmt, tooltipFormatter: pctFmt };
}

/** Select do gráfico por site: fundo neutro, sem hover de cor. */
export const SITE_ANALYTICS_SELECT_TRIGGER_CLASS =
  "w-full h-8 text-sm font-normal px-2 border border-gray-200 bg-white hover:bg-white focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-border dark:bg-card dark:hover:bg-card";
