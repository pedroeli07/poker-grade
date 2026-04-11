import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, History } from "lucide-react";
import { memo } from "react";
const STAT_CARD_CLS =
  "bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]";

const HistorySummaryCards = memo(function HistorySummaryCards({
  upgrades,
  downgrades,
  totalRecords,
}: {
  upgrades: number;
  downgrades: number;
  totalRecords: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className={STAT_CARD_CLS}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 shrink-0">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-500">{upgrades}</div>
            <p className="text-xs text-muted-foreground">Subidas</p>
          </div>
        </CardContent>
      </Card>

      <Card className={STAT_CARD_CLS}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/10 shrink-0">
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{downgrades}</div>
            <p className="text-xs text-muted-foreground">Descidas</p>
          </div>
        </CardContent>
      </Card>

      <Card className={STAT_CARD_CLS}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
            <History className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">Total de registros</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

HistorySummaryCards.displayName = "HistorySummaryCards";

export default HistorySummaryCards;
