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
import type { SharkscopeAnalyticsPeriod, TierStat } from "@/lib/types";
import { memo } from "react";

const AnalyticsTierPanel = memo(function AnalyticsTierPanel({
  period,
  tierStats,
  tierBarRows,
}: {
  period: SharkscopeAnalyticsPeriod;
  tierStats: TierStat[];
  tierBarRows: AnalyticsRoiBarRow[];
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Consolidado por Tier (ABI médio SharkScope): Low (&lt;$15), Mid ($15–$50), High (&gt;$50).
        Período: <span className="font-medium text-foreground">{period}</span>.
      </p>
      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-500/20 hover:bg-blue-500/20">
              <TableHead>Tier</TableHead>
              <TableHead>ROI Médio</TableHead>
              <TableHead>ROI Total</TableHead>
              <TableHead>Lucro Acumulado</TableHead>
              <TableHead>Volume (torneios)</TableHead>
              <TableHead>Jogadores no Tier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tierStats.map((s) => (
              <TableRow key={s.tier} className="hover:bg-sidebar-accent/50 bg-white">
                <TableCell className="font-semibold">{s.tier}</TableCell>
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
                <TableCell className="text-sm text-muted-foreground">{s.players}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AnalyticsRoiBarChart
        title="ROI total do time por tier (mesma fórmula ponderada)"
        rows={tierBarRows}
      />
    </div>
  );
});

AnalyticsTierPanel.displayName = "AnalyticsTierPanel";

export default AnalyticsTierPanel;
