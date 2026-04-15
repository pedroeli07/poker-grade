export type AnalyticsRoiBarRow = {
  key: string;
  shortLabel: string;
  fullLabel: string;
  roi: number | null;
};

export type AnalyticsRoiBarChartProps = {
  title: string;
  rows: AnalyticsRoiBarRow[];
  yAxisLabel?: string;
};
