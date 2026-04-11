import Link from "next/link";
import { Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnalyticsRoiBadge } from "@/components/sharkscope/analytics-cells";
import type { RankingEntry, SharkscopeAnalyticsPeriod } from "@/lib/types";
import { memo } from "react";

const AnalyticsRankingPanel = memo(function AnalyticsRankingPanel({
  ranking,
  period,
}: {
  ranking: RankingEntry[];
  period: SharkscopeAnalyticsPeriod;
}) {
  return (
    <div>
      {ranking.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-blue-500/10">
          <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Sem dados de cache para este período ({period}). Sincronize o SharkScope.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500/20 hover:bg-blue-500/20">
                <TableHead className="w-10">#</TableHead>
                <TableHead>Jogador</TableHead>
                <TableHead>ROI {period}</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((entry, i) => (
                <TableRow key={entry.player.id} className="hover:bg-sidebar-accent/50 bg-white">
                  <TableCell className="text-muted-foreground text-sm font-mono">{i + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{entry.player.name}</div>
                    {entry.player.nickname && (
                      <div className="text-xs text-muted-foreground">@{entry.player.nickname}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <AnalyticsRoiBadge roi={entry.roi} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.count > 0 ? entry.count.toFixed(0) : "—"}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/players/${entry.player.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Ver perfil →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
});

AnalyticsRankingPanel.displayName = "AnalyticsRankingPanel";

export default AnalyticsRankingPanel;
