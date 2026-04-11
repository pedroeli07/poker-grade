import { BarChart3 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AnalyticsProfitCell,
  AnalyticsRoiBadge,
} from "@/components/sharkscope/analytics-cells";
import { AnalyticsRoiBarChart, type AnalyticsRoiBarRow } from "@/components/sharkscope/analytics-roi-bar-chart";
import type { NetworkStat } from "@/lib/types";
import { memo } from "react";

const AnalyticsSitePanel = memo(function AnalyticsSitePanel({
  hasData,
  stats,
  siteBarRows,
}: {
  hasData: boolean;
  stats: NetworkStat[];
  siteBarRows: AnalyticsRoiBarRow[];
}) {
  return (
    <div>
      {!hasData ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-blue-500/10 px-4">
          <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-foreground">Sem estatísticas por rede no cache</p>
          <p className="text-xs mt-2 max-w-xl mx-auto leading-relaxed">
            Cadastre <strong>nicks SharkScope por rede</strong> (GGPoker, PokerStars, etc.) em cada
            jogador e rode <strong>Sincronizar SharkScope</strong>. O <em>player group</em> alimenta
            Ranking e Por TIER; esta aba consolida só redes reais (um barra por site).
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-500/10 hover:bg-transparent">
                  <TableHead>Rede</TableHead>
                  <TableHead>ROI Médio</TableHead>
                  <TableHead>ROI Total</TableHead>
                  <TableHead>Lucro Total</TableHead>
                  <TableHead>Volume (torneios)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((s) => (
                  <TableRow key={s.network} className="hover:bg-sidebar-accent/50">
                    <TableCell className="font-medium">{s.label}</TableCell>
                    <TableCell>
                      <AnalyticsRoiBadge roi={s.roi} />
                    </TableCell>
                    <TableCell>
                      <AnalyticsRoiBadge roi={s.roiWeighted} />
                    </TableCell>
                    <TableCell>
                      <AnalyticsProfitCell profit={s.profit} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.count !== null ? s.count.toFixed(0) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AnalyticsRoiBarChart
            title="ROI total do time por rede (Σ ROI×torneios / Σ torneios) — eixo Y em %"
            rows={siteBarRows}
          />
        </>
      )}
    </div>
  );
});

AnalyticsSitePanel.displayName = "AnalyticsSitePanel";

export default AnalyticsSitePanel;
