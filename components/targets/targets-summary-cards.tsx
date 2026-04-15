"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WithTargetsSummaryCards } from "@/components/targets/targets-section-bridge";

const TargetsSummaryCards = memo(function TargetsSummaryCards({
  summary,
}: {
  summary: { onTrack: number; attention: number; offTrack: number };
}) {
  return (
    <WithTargetsSummaryCards summary={summary}>
      {(cardsData) => (
        <div className="grid gap-4 md:grid-cols-3">
          {cardsData.map(({ statusKey, config, count, cardSurfaceClass }) => (
            <Card
              key={statusKey}
              className={`${cardSurfaceClass} shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] backdrop-blur-md transition-all duration-200 hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]`}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                  <config.icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${config.color}`}>{count}</div>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </WithTargetsSummaryCards>
  );
});

TargetsSummaryCards.displayName = "TargetsSummaryCards";

export default TargetsSummaryCards;
