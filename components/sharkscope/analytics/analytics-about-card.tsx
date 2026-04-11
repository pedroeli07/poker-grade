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
          • ROI médio: média simples dos AvROI; ROI total: Σ(ROI×torneios)/Σ(torneios) (mesmo jogador
          em vários nicks na mesma rede entra uma vez por nick).
        </p>
        <p>
          • Lucro total soma TotalProfit do SharkScope por entrada de cache (varredura completa do JSON
          para achar Profit/TotalProfit).
        </p>
      </CardContent>
    </Card>
  );
});

AnalyticsAboutCard.displayName = "AnalyticsAboutCard";

export default AnalyticsAboutCard;
