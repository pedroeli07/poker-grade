"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type AnalyticsRoiBarRow = {
  key: string;
  shortLabel: string;
  fullLabel: string;
  roi: number | null;
};

const CHART_HEIGHT = 450;

function barFill(roi: number): string {
  if (roi >= 5) return "#16a34a";
  if (roi >= 0) return "#22c55e";
  if (roi >= -20) return "#ca8a04";
  return "#dc2626";
}

export function AnalyticsRoiBarChart({
  title,
  rows,
  yAxisLabel = "ROI total (%)",
}: {
  title: string;
  rows: AnalyticsRoiBarRow[];
  yAxisLabel?: string;
}) {
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

  const data = rows
    .filter((r) => r.roi !== null)
    .map((r) => ({
      key: r.key,
      name: r.shortLabel,
      fullName: r.fullLabel,
      roi: r.roi as number,
    }));

  const rois = data.map((d) => d.roi);
  const minR = rois.length ? Math.min(0, ...rois) : 0;
  const maxR = rois.length ? Math.max(0, ...rois) : 10;
  const pad = Math.max(3, (maxR - minR) * 0.12);

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
      <div ref={wrapRef} className="w-full min-w-0" style={{ height: CHART_HEIGHT }}>
        {width > 0 ? (
          <BarChart
            width={width}
            height={CHART_HEIGHT}
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
                <Cell key={entry.key} fill={barFill(entry.roi)} />
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
}
