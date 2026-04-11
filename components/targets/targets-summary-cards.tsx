"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, XCircle } from "lucide-react";

const TargetsSummaryCards = memo(function TargetsSummaryCards({
  summary,
}: {
  summary: { onTrack: number; attention: number; offTrack: number };
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border border-emerald-500/20 bg-emerald-500/5 shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] backdrop-blur-md transition-all duration-200 hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-500">{summary.onTrack}</div>
            <p className="text-xs text-muted-foreground">No Caminho Certo</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-amber-500/20 bg-amber-500/5 shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] backdrop-blur-md transition-all duration-200 hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-500">{summary.attention}</div>
            <p className="text-xs text-muted-foreground">Atenção Necessária</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-red-500/20 bg-red-500/5 shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] backdrop-blur-md transition-all duration-200 hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{summary.offTrack}</div>
            <p className="text-xs text-muted-foreground">Fora da Meta</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

TargetsSummaryCards.displayName = "TargetsSummaryCards";

export default TargetsSummaryCards;
