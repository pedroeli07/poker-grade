"use client";

import { memo, useLayoutEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts";
import { ANALYTICS_ROI_BAR_CHART_HEIGHT } from "@/lib/constants/sharkscope/analytics";
import type { AnalyticsRoiBarChartProps } from "@/lib/types/sharkscope/analytics";
import { analyticsBarRoiFillByPercent, mapRoiBarChartData, roiBarYAxisDomain } from "@/lib/utils/sharkscope/analytics";

const AnalyticsRoiBarChart = memo(function AnalyticsRoiBarChart({
  title,
  rows,
  yAxisLabel = "ROI total (%)",
}: AnalyticsRoiBarChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const read = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setWidth(Math.floor(w));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = mapRoiBarChartData(rows);
  const rois = data.map((d) => d.roi);
  const { minR, maxR, pad } = roiBarYAxisDomain(rois);

  const h = ANALYTICS_ROI_BAR_CHART_HEIGHT;

  if (data.length === 0) {
    return (
      <div className="w-full min-w-0 mt-6 rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
        {title}
        <p className="mt-2">Nenhum ROI total disponível para plotar.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 mt-6 rounded-xl border border-border/60 bg-card/40 p-4">
      <p className="mb-3 text-center text-base font-medium leading-snug text-muted-foreground">
        {title}
      </p>
      <div ref={wrapRef} className="w-full min-w-0" style={{ height: h }}>
        {width > 0 ? (
          <BarChart
            width={width}
            height={h}
            data={data}
            margin={{ top: 12, right: 16, left: 8, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 14, fill: "var(--muted-foreground)" }}
              angle={-22}
              textAnchor="end"
              height={64}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 14, fill: "var(--muted-foreground)" }}
              domain={[minR - pad, maxR + pad]}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              width={56}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 13, fill: "var(--muted-foreground)", fontWeight: 500 },
              }}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as {
                  fullName: string;
                  roi: number;
                };
                return (
                  <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-md">
                    <p className="font-semibold">{row.fullName}</p>
                    <p className="text-muted-foreground">
                      ROI total (pond.): {row.roi >= 0 ? "+" : ""}
                      {row.roi.toFixed(1)}%
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="roi" name="ROI total" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={analyticsBarRoiFillByPercent(entry.roi)} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <div
            className="h-full w-full rounded-md bg-muted/30 animate-pulse"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
});

AnalyticsRoiBarChart.displayName = "AnalyticsRoiBarChart";

export default AnalyticsRoiBarChart;
