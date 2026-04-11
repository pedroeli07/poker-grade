import { Zap } from "lucide-react";
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
import { AnalyticsRoiBarChart } from "@/components/sharkscope/analytics-roi-bar-chart";
import { SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT } from "@/lib/constants/sharkscope-analytics-labels";
import type { SharkscopeAnalyticsPeriod, TypeStat } from "@/lib/types";
import { memo } from "react";

const AnalyticsBountyPanel = memo(function AnalyticsBountyPanel({
  period,
  hasTypeData,
  typeStats30d,
}: {
  period: SharkscopeAnalyticsPeriod;
  hasTypeData: boolean;
  typeStats30d: TypeStat[];
}) {
  const typeBarRows = typeStats30d.map((s) => ({
    key: s.type,
    shortLabel: SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type],
    fullLabel: SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type],
    roi: s.roiWeighted,
  }));

  return (
    <div className="space-y-4">
      {period === "90d" && (
        <p className="text-xs text-muted-foreground rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
          Breakdown Bounty / Vanilla / Satélite usa filtros SharkScope na janela de{" "}
          <strong>30 dias</strong> (buscas extras na sincronização). O seletor{" "}
          <strong>90d</strong> acima afeta Por Site, Ranking e Por TIER.
        </p>
      )}
      {!hasTypeData ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-amber-500/10">
          <Zap className="h-10 w-10 mx-auto mb-3 opacity-30 text-amber-500" />
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-500 mb-1">
            Sem dados por tipo de torneio
          </h3>
          <p className="text-xs max-w-lg mx-auto">
            Rode <strong>Sincronizar SharkScope</strong> para buscar estatísticas com filtros Type:B
            (Bounty), Type:SAT (Satélite) e excluindo ambos (Vanilla), além do resumo geral.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-amber-500/15 hover:bg-amber-500/15">
                <TableHead>Tipo</TableHead>
                <TableHead>ROI Médio</TableHead>
                <TableHead>ROI Total</TableHead>
                <TableHead>Lucro Total</TableHead>
                <TableHead>Volume (torneios)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typeStats30d.map((s) => (
                <TableRow key={s.type} className="hover:bg-sidebar-accent/50 bg-white">
                  <TableCell className="font-medium">{SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[s.type]}</TableCell>
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
      )}
      {hasTypeData && (
        <AnalyticsRoiBarChart
          title="ROI total por tipo de torneio (30d, filtros SharkScope Type:B / SAT / restante)"
          rows={typeBarRows}
        />
      )}
    </div>
  );
});

AnalyticsBountyPanel.displayName = "AnalyticsBountyPanel";

export default AnalyticsBountyPanel;
