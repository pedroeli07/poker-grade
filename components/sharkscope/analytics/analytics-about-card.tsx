import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cardClassName } from "@/lib/constants";
import { memo } from "react";

const AnalyticsAboutCard = memo(function AnalyticsAboutCard() {
  return (
    <Card className={`border-border/40 ${cardClassName}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Sobre os dados</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground space-y-1">
        <p>• Todos os dados são lidos do cache local — sem chamadas à API SharkScope.</p>
        <p>• O cache é atualizado automaticamente pelo cron job às 06h00 BRT.</p>
        <p>
          • ROI usa apenas <strong className="text-foreground">TotalROI</strong> (ROI total do
          SharkScope), sem AvROI: média simples entre entradas de cache; e “ponderado” =
          Σ(TotalROI×peso)/Σ(peso) com peso = Entries ou Count. Onde não houver TotalROI no JSON, a
          entrada não entra em médias de ROI.
        </p>
        <p>
          • Lucro total soma TotalProfit do SharkScope por entrada de cache (varredura completa do JSON
          para achar Profit/TotalProfit).
        </p>
        <p>
          • <strong className="text-foreground">Ranking:</strong> usa só o cache do resumo{" "}
          <code className="text-[11px]">Date:30D</code> ou <code className="text-[11px]">Date:90D</code>
          — não mistura com filtros por tipo (Bounty/Vanilla etc.).
        </p>
      </CardContent>
    </Card>
  );
});

AnalyticsAboutCard.displayName = "AnalyticsAboutCard";

export default AnalyticsAboutCard;
