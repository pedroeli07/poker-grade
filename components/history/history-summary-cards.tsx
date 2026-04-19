import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, History } from "lucide-react";
import { memo } from "react";
import { STAT_CARD_CLS } from "@/lib/constants";

const HistorySummaryCards = memo(function HistorySummaryCards({
  upgrades,
  downgrades,
  maintains,
  totalRecords,
}: {
  upgrades: number;
  downgrades: number;
  maintains: number;
  totalRecords: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card className={STAT_CARD_CLS}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 shrink-0">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-500">{upgrades}</div>
            <p className="text-sm text-muted-foreground">Subidas</p>
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
            <p className="text-sm text-muted-foreground">Descidas</p>
          </div>
        </CardContent>
      </Card>

      <Card className={STAT_CARD_CLS}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 shrink-0">
            <Minus className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-500">{maintains}</div>
            <p className="text-sm text-muted-foreground">Manutenções</p>
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
            <p className="text-sm text-muted-foreground">Total de registros</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

HistorySummaryCards.displayName = "HistorySummaryCards";

export default HistorySummaryCards;
