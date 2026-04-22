import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewDecisionButtons } from "@/components/review-decision-buttons";
import {
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import ReviewStatusBadge from "@/components/imports/review-status-badge";
import SchedulingBadge from "@/components/imports/scheduling-badge";
import type { ImportDetailPageData } from "@/lib/types/imports/index";
import { memo } from "react";

const ImportDetailTournamentsSection = memo(function ImportDetailTournamentsSection({
  activeTab,
  showActions,
  activeTournaments,
}: Pick<ImportDetailPageData, "activeTab" | "showActions" | "activeTournaments">) {
  if (activeTournaments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
        <CheckCircle2 className="h-10 w-10 mb-3 opacity-30" />
        <p className="text-sm">Nenhum torneio nesta categoria.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-500/20">
            <TableHead className="pl-6 w-[380px]">Torneio</TableHead>
            <TableHead>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                Site
              </span>
            </TableHead>
            <TableHead>
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                Buy-in
              </span>
            </TableHead>
            <TableHead>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Data
              </span>
            </TableHead>
            <TableHead>Status</TableHead>
            {activeTab === "rebuy" && <TableHead>Rebuy</TableHead>}
            {showActions && activeTab === "extra" && (
              <TableHead className="text-right pr-6">Decisão</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeTournaments.map((t) => (
            <TableRow
              key={t.id}
              className="bg-white hover:bg-sidebar-accent/30 group border-b border-border/50 last:border-0"
            >
              <TableCell className="pl-6">
                <div
                  className="font-medium text-[15px] line-clamp-2 max-w-[360px]"
                  title={t.tournamentName}
                >
                  {t.tournamentName}
                </div>
                {t.speed && (
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {t.speed}
                    {t.priority && t.priority !== "None" && (
                      <span
                        className={`ml-2 font-medium ${
                          t.priority === "HIGH" ? "text-amber-500" : "text-muted-foreground"
                        }`}
                      >
                        · {t.priority}
                      </span>
                    )}
                  </span>
                )}
              </TableCell>

              <TableCell>
                <Badge
                  variant="outline"
                  className={`text-xs border ${
                    t.site.toLowerCase().includes("pokerstars")
                      ? "border-red-500/30 text-red-500 bg-red-500/5"
                      : "border-blue-500/30 text-blue-500 bg-blue-500/5"
                  }`}
                >
                  {t.site}
                </Badge>
              </TableCell>

              <TableCell>
                <span className="font-mono text-[15px] font-semibold text-foreground/90">
                  {t.buyInCurrency ?? "$"}
                  {t.buyInValue.toFixed(2)}
                </span>
              </TableCell>

              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {format(t.date, "dd/MM/yy HH:mm")}
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1.5 items-start">
                  <SchedulingBadge scheduling={t.scheduling} />
                  {t.reviewItem && <ReviewStatusBadge status={t.reviewItem.status} />}
                </div>
              </TableCell>

              {activeTab === "rebuy" && (
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-orange-500 text-sm font-semibold">
                    <RefreshCw className="h-4 w-4" />
                    Rebuy
                  </span>
                </TableCell>
              )}

              {showActions && activeTab === "extra" && (
                <TableCell className="text-right pr-6">
                  {t.reviewItem ? (
                    t.reviewItem.status === "PENDING" ? (
                      <ReviewDecisionButtons reviewId={t.reviewItem.id} />
                    ) : (
                      <ReviewStatusBadge status={t.reviewItem.status} />
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

ImportDetailTournamentsSection.displayName = "ImportDetailTournamentsSection";

export default ImportDetailTournamentsSection;
