import type { AnalyticsRoiBarRow } from "@/lib/types/analyticsRoiBarChart";

export type AnalyticsRoiBarChartDatum = {
  key: string;
  name: string;
  fullName: string;
  roi: number;
};

export function mapRoiBarChartData(rows: AnalyticsRoiBarRow[]): AnalyticsRoiBarChartDatum[] {
  return rows
    .filter((r) => r.roi !== null)
    .map((r) => ({
      key: r.key,
      name: r.shortLabel,
      fullName: r.fullLabel,
      roi: r.roi as number,
    }));
}

export function roiBarYAxisDomain(rois: number[]): { minR: number; maxR: number; pad: number } {
  const minR = rois.length ? Math.min(0, ...rois) : 0;
  const maxR = rois.length ? Math.max(0, ...rois) : 10;
  const pad = Math.max(3, (maxR - minR) * 0.12);
  return { minR, maxR, pad };
}
