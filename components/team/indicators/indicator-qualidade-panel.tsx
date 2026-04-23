"use client";

import { memo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BookOpen, Info, TrendingDown, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";
import {
  INDICATORS_PLAYER_CONSUMPTION,
  INDICATORS_QT_BARS,
  INDICATORS_QT_KPI_CARDS,
  INDICATORS_STUDY_CHART,
} from "@/lib/constants/team/indicators-analytics-mock";

const PlayerRow = memo(function PlayerRow({
  player,
}: {
  player: (typeof INDICATORS_PLAYER_CONSUMPTION)[0];
}) {
  const badgeClass = player.classes.startsWith("1")
    ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200"
    : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200";
  return (
    <div className="flex flex-col justify-between p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center">
      <span className="mb-2 text-sm font-semibold text-foreground sm:mb-0">{player.name}</span>
      <div className="flex flex-wrap items-center gap-6 sm:gap-8">
        {(
          [
            { value: player.reviews, label: "reviews" },
            { value: player.spots, label: "spots" },
            { value: player.study, label: "estudo" },
          ] as const
        ).map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-sm font-bold leading-none text-foreground">{value}</span>
            <span className="mt-1 text-[10px] font-medium uppercase text-muted-foreground">{label}</span>
          </div>
        ))}
        <Badge variant="outline" className={cn("rounded border px-2 py-0 text-[10px] font-bold shadow-none", badgeClass)}>
          {player.classes}
        </Badge>
      </div>
    </div>
  );
});
PlayerRow.displayName = "PlayerRow";

export const IndicatorQualidadePanel = memo(function IndicatorQualidadePanel() {
  const studyData = [...INDICATORS_STUDY_CHART];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <h4 className="text-sm font-semibold text-foreground">Indicadores de qualidade técnica (proxy)</h4>
          <p className="text-xs font-medium leading-relaxed text-muted-foreground">
            O poker não mede &quot;qualidade&quot; diretamente. Estes números refletem esforço (estudo, review,
            consumo) — orientação, não veredito de domínio técnico.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {INDICATORS_QT_KPI_CARDS.map(({ title, value, progress, meta, trend, icon: Icon }) => (
          <Card key={title} className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {title}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  <span className="text-[10px] font-bold text-red-400">{trend}</span>
                </div>
              </div>
              <div className="mb-4 text-3xl font-bold text-foreground">{value}</div>
              <Progress value={progress} className="h-1.5 bg-muted [&>[data-slot=progress-indicator]]:bg-primary" />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-primary">{progress}% da meta</span>
                <span className="text-[10px] font-medium text-muted-foreground">Meta: {meta}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            Evolução semanal de estudo (últimas 8 semanas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-2 h-[250px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} dx={-8} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
                />
                {INDICATORS_QT_BARS.map(({ key, name, fill }) => (
                  <Bar key={key} dataKey={key} name={name} fill={fill} radius={[4, 4, 0, 0]} barSize={32} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Video className="h-5 w-5 text-primary" />
            Consumo de conteúdo por jogador
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {INDICATORS_PLAYER_CONSUMPTION.map((player, idx) => (
              <PlayerRow key={`${player.name}-${idx}`} player={player} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
IndicatorQualidadePanel.displayName = "IndicatorQualidadePanel";
