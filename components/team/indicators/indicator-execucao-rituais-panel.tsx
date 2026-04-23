"use client";

import { memo } from "react";
import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";
import {
  INDICATORS_DELAYED_ITEMS,
  INDICATORS_EXEC_SUMMARY_METRICS,
  INDICATORS_TASK_SUMMARY,
  INDICATORS_TOP_EXECUTORS,
} from "@/lib/constants/team/indicators-analytics-mock";

const ExecutorRow = memo(function ExecutorRow({
  player,
  idx,
}: {
  player: (typeof INDICATORS_TOP_EXECUTORS)[0];
  idx: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700 dark:bg-orange-950/50 dark:text-orange-200">
            {idx + 1}
          </span>
          <span className="font-semibold text-foreground">{player.name}</span>
        </div>
        <span className="font-bold text-primary tabular-nums">{player.progress}%</span>
      </div>
      <Progress value={player.progress} className="h-2 bg-muted [&>[data-slot=progress-indicator]]:bg-primary/80" />
    </div>
  );
});
ExecutorRow.displayName = "ExecutorRow";

export const IndicatorExecutionRitualsPanel = memo(function IndicatorExecutionRitualsPanel() {
  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {INDICATORS_EXEC_SUMMARY_METRICS.map((item, idx) => (
          <Card key={idx} className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm">
            <CardContent className="p-4 pt-5">
              <div className="mb-4 flex items-start gap-3">
                <div className={cn("rounded-lg bg-primary/10 p-2", item.iconColor)}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {item.title}
                  </div>
                  <div className="text-xl font-bold text-foreground">{item.value}</div>
                </div>
              </div>
              <Progress
                value={item.progress}
                className="h-1.5 bg-muted [&>[data-slot=progress-indicator]]:bg-primary"
              />
              <div className="mt-2 text-[10px] font-medium text-muted-foreground">{item.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Tarefas: abertas vs concluídas
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {INDICATORS_TASK_SUMMARY.map(({ icon: Icon, label, value, colorClass, cardClass }) => (
            <Card key={label} className={cn("overflow-hidden rounded-xl border shadow-sm", cardClass)}>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Icon className={cn("mb-2 h-6 w-6", colorClass)} />
                <div className="text-3xl font-bold text-foreground">{value}</div>
                <div className={cn("mt-1 text-xs font-medium uppercase tracking-wider", colorClass || "text-muted-foreground")}>
                  {label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-emerald-600">
              <TrendingUp className="h-5 w-5" />
              Top executores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {INDICATORS_TOP_EXECUTORS.map((player, idx) => (
              <ExecutorRow key={player.name} player={player} idx={idx} />
            ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-red-500">
              <AlertCircle className="h-5 w-5" />
              Em atraso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {INDICATORS_DELAYED_ITEMS.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:bg-muted/35"
              >
                <div>
                  <div className="text-sm font-bold text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.task}</div>
                </div>
                <Badge
                  variant="secondary"
                  className="border-0 bg-red-100 text-[10px] font-bold text-red-600 shadow-none hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300"
                >
                  {item.delayed}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/25 p-4">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div>
          <h4 className="text-xs font-semibold text-foreground">Ação automática (regra)</h4>
          <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
            Abaixo de <span className="font-bold text-amber-600">70% de reportes</span>, o fluxo costuma
            sugerir tarefa e alerta ao gestor. Ajuste regras em Rituais / Governança quando integrar.
          </p>
        </div>
      </div>
    </div>
  );
});
IndicatorExecutionRitualsPanel.displayName = "IndicatorExecutionRitualsPanel";
