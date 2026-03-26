import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle2, ShieldAlert, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { requireSession } from "@/lib/auth/session";
import { canReview } from "@/lib/auth/rbac";
import { getPendingReviewsForSession } from "@/lib/data/queries";
import { ReviewDecisionButtons } from "@/components/review-decision-buttons";

export default async function ReviewPage() {
  const session = await requireSession();
  const pendingReviews = await getPendingReviewsForSession(session);
  const showActions = canReview(session);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-amber-500">Revisão de Torneios</h2>
        <p className="text-muted-foreground mt-1">
          Analise e julgue torneios que ficaram sinalizados como Suspeitos ou Fora de Grade.
        </p>
      </div>

      <Card className="glass-card border-amber-500/20">
        <CardHeader className="bg-amber-500/5 pb-4 border-b border-border">
          <CardTitle className="flex items-center gap-2 text-amber-500">
            <AlertCircle className="h-5 w-5" /> Fila de Julgamento
            <Badge variant="outline" className="ml-2 bg-amber-500 text-amber-950 border-0">{pendingReviews.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pendingReviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-emerald-500/50" />
              Nenhum torneio pendente de revisão. Excelente!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Jogador</TableHead>
                  <TableHead>Torneio</TableHead>
                  <TableHead>Buy-in</TableHead>
                  <TableHead>Motivo Retenção</TableHead>
                  <TableHead className="text-right pr-6">Decisão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-sidebar-accent/30 group">
                    <TableCell className="pl-6">
                      <div className="font-medium text-foreground">{review.player.name}</div>
                      <div className="text-xs text-muted-foreground">{review.player.coach?.name || "Sem coach"}</div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm line-clamp-1 max-w-[250px]" title={review.tournament.tournamentName}>
                        {review.tournament.tournamentName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                        <span>{review.tournament.site}</span>
                        <span>•</span>
                        <span>{format(review.tournament.date, "dd/MM HH:mm")}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        {review.tournament.buyInValue}
                      </div>
                    </TableCell>

                    <TableCell>
                      {review.tournament.matchStatus === "SUSPECT" ? (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">Suspeito</Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10"><ShieldAlert className="h-3 w-3 mr-1"/> Fora de Grade</Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      {showActions ? (
                        <ReviewDecisionButtons reviewId={review.id} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
