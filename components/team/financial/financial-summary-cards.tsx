"use client";

import { memo } from "react";
import { DollarSign, FileText, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { FinancialKpiCard, FinancialSummaryCardsProps } from "@/lib/types/team/financial";

const trendIcon = (t: FinancialKpiCard["trend"]) => {
  if (t === "up") return TrendingUp;
  if (t === "down") return TrendingDown;
  return FileText;
};

export const FinancialSummaryCards = memo(function FinancialSummaryCards({ items }: FinancialSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((kpi) => {
        const SubIcon = trendIcon(kpi.trend);
        return (
          <Card key={kpi.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {kpi.id === "bankroll" ? (
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
                  {kpi.value}
                </div>
              ) : (
                <div
                  className={cn(
                    "text-2xl font-bold",
                    kpi.id === "makeup" && "text-orange-600",
                  )}
                >
                  {kpi.value}
                </div>
              )}
              <p
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs font-medium",
                  kpi.subVariant === "emerald" && "text-emerald-600",
                  kpi.subVariant === "red" && "text-red-600",
                  kpi.subVariant === "muted" && "font-normal text-muted-foreground",
                )}
              >
                <SubIcon className="h-3 w-3" />
                {kpi.subLabel}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

FinancialSummaryCards.displayName = "FinancialSummaryCards";
