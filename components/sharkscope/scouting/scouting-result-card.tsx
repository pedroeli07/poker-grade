import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Save } from "lucide-react";
import { POKER_NETWORKS } from "@/lib/constants";
import ScoutingRoiDisplay from "@/components/sharkscope/scouting/scouting-roi-display";
import ScoutingStatCard from "@/components/sharkscope/scouting/scounting-stat-card";
import type { PokerNetworkKey, ScoutingSearchStats } from "@/lib/types";
import { scoutingProfitClass, scoutingProfitText } from "@/lib/utils/sharlscope/scouting/scouting-format";
import { memo } from "react";

const ScoutingResultCard = memo(function ScoutingResultCard({
  nick,
  network,
  searchStats,
  nickId,
  nlqQuestion,
  setNlqQuestion,
  nlqAnswer,
  notes,
  setNotes,
  isPending,
  handleNlq,
  handleSave,
}: {
  nick: string;
  network: PokerNetworkKey;
  searchStats: ScoutingSearchStats;
  nickId: string | null;
  nlqQuestion: string;
  setNlqQuestion: (v: string) => void;
  nlqAnswer: Record<string, unknown> | null;
  notes: string;
  setNotes: (v: string) => void;
  isPending: boolean;
  handleNlq: () => void;
  handleSave: () => void;
}) {
  const { roi, profit, count, abi, entrants } = searchStats;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Resultado: <span className="text-primary">{nick}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {POKER_NETWORKS[network]?.label}
            </Badge>
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleSave} disabled={isPending}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Salvar análise
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <ScoutingStatCard label="ROI" value={<ScoutingRoiDisplay roi={roi} />} />
          <ScoutingStatCard
            label="Lucro Total"
            value={
              profit !== null ? (
                <span className={scoutingProfitClass(profit)}>{scoutingProfitText(profit)}</span>
              ) : (
                "—"
              )
            }
          />
          <ScoutingStatCard label="Volume" value={count !== null ? count.toFixed(0) : "—"} />
          <ScoutingStatCard label="ABI Médio" value={abi !== null ? `$${abi.toFixed(0)}` : "—"} />
          <ScoutingStatCard
            label="Field Size"
            value={entrants !== null ? entrants.toFixed(0) : "—"}
          />
        </div>

        {nickId && (
          <div className="border-t border-border/40 pt-4 space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Pergunta ao SharkScope (NLQ)
            </Label>
            <div className="flex gap-2">
              <Input
                value={nlqQuestion}
                onChange={(e) => setNlqQuestion(e.target.value)}
                placeholder="Ex: Qual foi a tendência de ROI nos últimos 3 meses?"
                disabled={isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNlq();
                }}
              />
              <Button
                onClick={handleNlq}
                disabled={isPending || !nlqQuestion.trim()}
                variant="outline"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Perguntar"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Consome 1 busca adicional.</p>
            {nlqAnswer && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
                <pre className="whitespace-pre-wrap font-sans text-xs">
                  {JSON.stringify(nlqAnswer, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-border/40 pt-4 space-y-2">
          <Label className="text-sm">Notas da análise</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações sobre o jogador (estilo de jogo, fit com o time, etc.)"
            rows={3}
            disabled={isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
});

ScoutingResultCard.displayName = "ScoutingResultCard";

export default ScoutingResultCard;
