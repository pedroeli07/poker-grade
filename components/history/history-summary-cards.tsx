import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, History } from "lucide-react";
import { memo } from "react";

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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 shadow-lg shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:from-emerald-500/10 hover:to-emerald-500/20 hover:shadow-emerald-500/20 group">
        <div className="absolute -right-6 -top-6 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          <TrendingUp className="h-32 w-32 text-emerald-500" />
        </div>
        <CardContent className="p-5 flex items-center gap-4 relative z-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 shrink-0 shadow-inner ring-1 ring-emerald-500/30">
            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{upgrades}</div>
            <p className="text-sm font-semibold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider">Subidas</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-500/10 shadow-lg shadow-red-500/5 transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:from-red-500/10 hover:to-red-500/20 hover:shadow-red-500/20 group">
        <div className="absolute -right-6 -top-6 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
          <TrendingDown className="h-32 w-32 text-red-500" />
        </div>
        <CardContent className="p-5 flex items-center gap-4 relative z-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/20 shrink-0 shadow-inner ring-1 ring-red-500/30">
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 tracking-tight">{downgrades}</div>
            <p className="text-sm font-semibold text-red-600/80 dark:text-red-400/80 uppercase tracking-wider">Descidas</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10 shadow-lg shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:from-amber-500/10 hover:to-amber-500/20 hover:shadow-amber-500/20 group">
        <div className="absolute -right-6 -top-6 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Minus className="h-32 w-32 text-amber-500" />
        </div>
        <CardContent className="p-5 flex items-center gap-4 relative z-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/20 shrink-0 shadow-inner ring-1 ring-amber-500/30">
            <Minus className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">{maintains}</div>
            <p className="text-sm font-semibold text-amber-600/80 dark:text-amber-400/80 uppercase tracking-wider">Manutenções</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10 shadow-lg shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:from-blue-500/10 hover:to-blue-500/20 hover:shadow-blue-500/20 group">
        <div className="absolute -right-6 -top-6 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
          <History className="h-32 w-32 text-blue-500" />
        </div>
        <CardContent className="p-5 flex items-center gap-4 relative z-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 shrink-0 shadow-inner ring-1 ring-blue-500/30">
            <History className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">{totalRecords}</div>
            <p className="text-sm font-semibold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider">Registros</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

HistorySummaryCards.displayName = "HistorySummaryCards";

export default HistorySummaryCards;
