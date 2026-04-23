"use client";

import { memo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils/cn";
import {
  INDICATORS_CHART_WEEKLY_ROI,
  INDICATORS_PERFORMANCE_BOTTOM_PLAYERS,
  INDICATORS_PERFORMANCE_FULL_TABLE,
  INDICATORS_PERFORMANCE_TABLE_HEADS,
  INDICATORS_PERFORMANCE_TOP_PLAYERS,
} from "@/lib/constants/team/indicators-analytics-mock";

const PlayerList = memo(function PlayerList({
  players,
  title,
  colorClass,
  icon: Icon,
}: {
  players: { name: string; roi: string; tournaments: number; amos?: boolean }[];
  title: string;
  colorClass: string;
  icon: typeof TrendingUp;
}) {
  return (
    <Card className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className={cn("flex items-center gap-2 text-lg", colorClass)}>
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/60">
          {players.map((player, idx) => {
            const isPositive = !player.roi.startsWith("-");
            return (
              <div
                key={`${player.name}-${idx}`}
                className="flex items-center justify-between bg-card px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-4 shrink-0 text-sm font-medium text-muted-foreground">{idx + 1}.</span>
                  <span className="truncate text-sm font-semibold text-foreground">{player.name}</span>
                  {player.amos ? (
                    <Badge
                      variant="outline"
                      className="shrink-0 border-amber-200/80 bg-amber-50 px-1.5 py-0 text-[10px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                    >
                      Am. amostra baixa
                    </Badge>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      isPositive ? "text-emerald-600" : "text-red-500",
                    )}
                  >
                    {player.roi}
                  </span>
                  <span className="w-10 text-right text-[10px] font-medium text-muted-foreground">
                    ({player.tournaments} t)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
PlayerList.displayName = "PlayerList";

export const IndicatorPerformancePanel = memo(function IndicatorPerformancePanel() {
  const [minTourneys, setMinTourneys] = useState("30");

  return (
    <div className="space-y-6 pb-12">
      <Card className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            ROI do time por semana (últimas 8 semanas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...INDICATORS_CHART_WEEKLY_ROI]} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  stroke="hsl(var(--border))"
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${v}%`, "ROI"]}
                />
                <Line
                  type="monotone"
                  dataKey="roi"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--card))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex flex-col gap-2 border-t border-border/50 pt-6 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-sm font-medium text-muted-foreground">Mínimo de torneios na semana:</span>
            <div className="w-24">
              <Input
                type="number"
                min={0}
                value={minTourneys}
                onChange={(e) => setMinTourneys(e.target.value)}
                className="h-8 text-center"
                aria-label="Mínimo de torneios na semana"
              />
            </div>
            <span className="text-xs text-muted-foreground">(reduz ruído de amostra baixa)</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PlayerList
          players={INDICATORS_PERFORMANCE_TOP_PLAYERS}
          title="Top 10 ROI"
          colorClass="text-emerald-600"
          icon={TrendingUp}
        />
        <PlayerList
          players={INDICATORS_PERFORMANCE_BOTTOM_PLAYERS}
          title="Bottom 10 ROI"
          colorClass="text-red-500"
          icon={TrendingDown}
        />
      </div>

      <Card className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-foreground">Tabela completa por jogador</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {INDICATORS_PERFORMANCE_TABLE_HEADS.map((h, i) => (
                    <TableHead
                      key={h}
                      className={cn(
                        "h-10 text-xs font-semibold text-muted-foreground",
                        i > 0 ? "text-center" : "w-[200px] text-left",
                      )}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {INDICATORS_PERFORMANCE_FULL_TABLE.map((row, idx) => {
                  const isNegProfit = row.profit.startsWith("$-");
                  const isNegRoi = row.roi.startsWith("-");
                  return (
                    <TableRow
                      key={`${row.name}-${idx}`}
                      className="border-border/50 hover:bg-muted/25"
                    >
                      <TableCell className="py-3 text-sm font-semibold text-foreground">{row.name}</TableCell>
                      <TableCell className="py-3 text-center text-sm font-medium text-foreground/90">{row.abi}</TableCell>
                      <TableCell
                        className={cn(
                          "py-3 text-center text-sm font-bold tabular-nums",
                          isNegRoi ? "text-red-500" : "text-emerald-500",
                        )}
                      >
                        {row.roi}
                      </TableCell>
                      <TableCell className="py-3 text-center text-sm text-foreground/90">
                        {row.tournaments}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-3 text-center text-sm font-medium tabular-nums",
                          isNegProfit ? "text-red-500" : "text-emerald-500",
                        )}
                      >
                        {row.profit}
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        {row.trend === "up" ? (
                          <TrendingUp className="mx-auto h-4 w-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="mx-auto h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
IndicatorPerformancePanel.displayName = "IndicatorPerformancePanel";
