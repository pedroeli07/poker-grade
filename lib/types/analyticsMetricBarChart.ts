import type { SiteChartYMetric } from "@/lib/site-analytics-chart";

export type AnalyticsMetricBarRow = {
  key: string;
  shortLabel: string;
  fullLabel: string;
  value: number;
};

export type AnalyticsMetricBarChartProps = {
  title: string;
  rows: AnalyticsMetricBarRow[];
  yAxisLabel: string;
  metric: SiteChartYMetric;
  tickFormatter: (v: number) => string;
  tooltipFormatter: (v: number) => string;
  /** Se false, o título não é renderizado (ex.: título no card pai). */
  showTitle?: boolean;
  /** Ex.: mt-0 quando o gráfico fica ao lado da tabela */
  className?: string;
};
