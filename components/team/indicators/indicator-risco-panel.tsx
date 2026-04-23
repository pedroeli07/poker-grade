"use client";

import { memo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  INDICATORS_ESTANCA_SANGRIA,
  INDICATORS_INCREASING_MAKEUP,
  INDICATORS_NEGATIVE_ROI_STREAK,
  INDICATORS_RISCO_TOP_CARDS,
  INDICATORS_SEVERITY_BADGE,
} from "@/lib/constants/team/indicators-analytics-mock";

const MakeupCard = memo(function MakeupCard({
  player,
}: {
  player: (typeof INDICATORS_INCREASING_MAKEUP)[0];
}) {
  return (
    <div className="group mb-2 flex cursor-pointer flex-col justify-between rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors last:mb-0 hover:bg-muted/40 sm:flex-row sm:items-center">
      <div>
        <div className="mb-1 text-sm font-semibold text-foreground">{player.name}</div>
        <div className="text-xs font-medium text-muted-foreground">
          Makeup: <span className="text-foreground">{player.makeup}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 sm:mt-0">
        <Badge
          variant="secondary"
          className={cn(
            "px-2 text-[10px] font-medium",
            INDICATORS_SEVERITY_BADGE[player.severity] ?? "border-border",
          )}
        >
          {player.severity}
        </Badge>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      </div>
    </div>
  );
});
MakeupCard.displayName = "MakeupCard";

export const IndicatorRiscoPanel = memo(function IndicatorRiscoPanel() {
  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {INDICATORS_RISCO_TOP_CARDS.map(
          ({ label, value, sub, icon: Icon, cardClass, iconWrapClass, showTrend }) => (
            <Card
              key={label}
              className={cn("overflow-hidden rounded-xl border shadow-sm", cardClass)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      iconWrapClass,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold leading-tight text-foreground">{value}</div>
                    <div className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</div>
                    {showTrend && sub ? (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                        {sub} <TrendingUp className="h-3 w-3" />
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-amber-600">
              <TrendingUp className="h-5 w-5" />
              <span className="text-foreground">Jogadores com makeup crescente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="p-1">
              {INDICATORS_INCREASING_MAKEUP.map((p, idx) => (
                <MakeupCard key={`${p.name}-${idx}`} player={p} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-foreground">Jogadores em estanca-sangria</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {INDICATORS_ESTANCA_SANGRIA.map((player, idx) => (
              <div
                key={`${player.name}-${idx}`}
                className="relative mb-3 cursor-pointer rounded-lg border border-red-200/60 bg-red-50/50 p-5 transition-colors last:mb-0 hover:bg-red-50/80 dark:border-red-900/40 dark:bg-red-950/20"
              >
                <div className="absolute right-4 top-4">
                  <Badge
                    variant="secondary"
                    className="border border-red-200/80 bg-red-100 text-[10px] font-medium text-red-800 shadow-sm hover:bg-red-100 dark:bg-red-950/50 dark:text-red-200"
                  >
                    {player.severity}
                  </Badge>
                </div>
                <div className="mb-4 pr-16 text-sm font-bold text-foreground">{player.name}</div>
                <div className="grid grid-cols-3 gap-4">
                  {(
                    [
                      { label: "Makeup", value: player.makeup, align: "" },
                      { label: "ROI", value: player.roi, align: "text-center" },
                      { label: "ABI", value: player.abi, align: "text-right" },
                    ] as const
                  ).map(({ label, value, align }) => (
                    <div key={label}>
                      <div className={cn("mb-1 text-xs font-medium text-muted-foreground", align)}>{label}</div>
                      <div
                        className={cn(
                          "text-sm font-bold",
                          label === "ABI" ? "text-foreground" : "text-red-600",
                          align,
                        )}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-red-400">
            <TrendingDown className="h-5 w-5" />
            <span className="text-foreground">Semanas consecutivas com ROI negativo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-1 gap-3 p-2 md:grid-cols-2">
            {INDICATORS_NEGATIVE_ROI_STREAK.map((player, idx) => (
              <div
                key={`${player.name}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-4"
              >
                <div>
                  <div className="mb-1 text-sm font-semibold text-foreground">{player.name}</div>
                  <div className="text-xs font-medium text-muted-foreground">ROI: {player.roi}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-500 tabular-nums">{player.weeks}</div>
                  <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    semanas
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Gerar decisões sugeridas (WBR)</h4>
            <p className="text-xs text-muted-foreground">
              Reduzir ABI, plano de recuperação, 1:1 obrigatório — registe em Governança.
            </p>
          </div>
        </div>
        <Button type="button" asChild className="shrink-0">
          <Link href="/admin/time/governanca">Abrir governança</Link>
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Lembrete de governança</h4>
          <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/90">
            Jogador em risco sem decisão = gestão omissa. Cada alerta listado aqui deve ter ação
            registrada (fluxo, decisão ou tarefa).
          </p>
        </div>
      </div>
    </div>
  );
});
IndicatorRiscoPanel.displayName = "IndicatorRiscoPanel";
