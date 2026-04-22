"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis} from "recharts";
import { ANALYTICS_METRIC_BAR_CHART_HEIGHT } from "@/lib/constants/sharkscope/analytics";
import type { AnalyticsMetricBarChartProps } from "@/lib/types/sharkscope/analytics";
import { metricBarFillForCell, metricBarYAxisDomain } from "@/lib/utils/sharkscope/analytics";
import { cn } from "@/lib/utils/cn";
export function AnalyticsMetricBarChart({
  title,
  rows,
  yAxisLabel,
  metric,
  tickFormatter,
  tooltipFormatter,
  className,
  showTitle = true,
}: AnalyticsMetricBarChartProps) {
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

  const data = rows.map((r) => ({
    key: r.key,
    name: r.shortLabel,
    fullName: r.fullLabel,
    value: r.value,
  }));

  const values = data.map((d) => d.value);
  const { domainMin, domainMax } = metricBarYAxisDomain(metric, values);

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "w-full min-w-0 mt-6 rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-center text-sm text-muted-foreground",
          className
        )}
      >
        {showTitle ? (
          <p className="px-3 py-2 text-sm font-medium text-muted-foreground">{title}</p>
        ) : null}
        <p className={showTitle ? "mt-2" : undefined}>Nenhum dado disponível para o eixo Y selecionado.</p>
      </div>
    );
  }

  const h = ANALYTICS_METRIC_BAR_CHART_HEIGHT;

  return (
    <div
      className={cn("w-full min-w-0 mt-6 rounded-xl border border-border/60 p-3 sm:p-4", className)}
    >
      {showTitle ? (
        <p className="mb-2 px-1 py-1 text-center text-base font-medium leading-snug text-muted-foreground">
          {title}
        </p>
      ) : null}
      <div ref={wrapRef} className="w-full min-w-0" style={{ height: h }}>
        {width > 0 ? (
          <BarChart
            width={width}
            height={h}
            data={data}
            margin={{ top: 4, right: 8, left: 10, bottom: 46 }}
            barCategoryGap="6%"
          >
            <defs>
              <linearGradient id="coinPokerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#450a0a" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              <linearGradient id="wptGlobalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 14, fill: "var(--muted-foreground)" }}
              angle={-22}
              textAnchor="end"
              height={50}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 14, fill: "var(--muted-foreground)" }}
              domain={[domainMin, domainMax]}
              tickFormatter={tickFormatter}
              width={68}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: "insideLeft",
                offset: 6,
                style: {
                  fontSize: 13,
                  fill: "var(--muted-foreground)",
                  fontWeight: 500,
                  textAnchor: "middle",
                },
              }}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as { fullName: string; value: number };
                return (
                  <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-md">
                    <p className="font-semibold">{row.fullName}</p>
                    <p className="text-muted-foreground">{tooltipFormatter(row.value)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" name={yAxisLabel} radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={metricBarFillForCell(metric, entry.value, entry.key)} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <div className="h-full w-full rounded-md bg-muted/30 animate-pulse" aria-hidden />
        )}
      </div>
    </div>
  );
}
