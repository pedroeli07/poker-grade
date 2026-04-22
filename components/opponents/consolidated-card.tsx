import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Sparkles } from "lucide-react";
import type { OpponentConsolidated } from "@/lib/types/opponent";
import { OPPONENT_CLASSIFICATION_LABELS, OPPONENT_STYLE_LABELS } from "@/lib/types/opponent";
import type { OpponentClassification, OpponentStyle } from "@prisma/client";
import { cn } from "@/lib/utils/cn";

const CONFIDENCE_META: Record<
  OpponentConsolidated["confidence"],
  { label: string; dots: number; color: string }
> = {
  low: { label: "Baixa", dots: 1, color: "bg-amber-500" },
  medium: { label: "Média", dots: 2, color: "bg-sky-500" },
  high: { label: "Alta", dots: 3, color: "bg-emerald-500" },
};

function DistributionBars({
  counts,
  labels,
  winner,
}: {
  counts: Record<string, number>;
  labels: Record<string, string>;
  winner: string | null;
}) {
  const entries = Object.entries(counts).sort(([, a], [, b]) => b - a);
  if (entries.length === 0) return <span className="text-sm text-muted-foreground">—</span>;
  const total = entries.reduce((acc, [, c]) => acc + c, 0);
  return (
    <div className="space-y-1.5">
      {entries.map(([k, c]) => {
        const pct = total > 0 ? Math.round((c / total) * 100) : 0;
        const isWinner = k === winner;
        return (
          <div key={k} className="space-y-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className={cn("font-medium", isWinner ? "text-foreground" : "text-muted-foreground")}>
                {labels[k] ?? k}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {c} · {pct}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isWinner ? "bg-primary" : "bg-muted-foreground/40",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ConsolidatedCard({ consolidated }: { consolidated: OpponentConsolidated }) {
  const empty = consolidated.notesUsed === 0;
  const confidence = CONFIDENCE_META[consolidated.confidence];

  return (
    <Card className="relative overflow-hidden border-border/60 shadow-sm ring-1 ring-border/40">
      {/* top accent gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
      />

      <CardHeader className="relative border-b border-border/50 pb-4">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <Sparkles className="size-4 text-primary" />
          </span>
          Sugestão automática
        </CardTitle>
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3 shrink-0" />
          Calculada a partir de todas as notas ativas; não substitui observações individuais.
        </p>
      </CardHeader>

      <CardContent className="relative space-y-5 pt-5">
        <Section
          title="Classificação predominante"
          winnerBadge={
            !empty && consolidated.classification && !consolidated.classificationTie ? (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
                {OPPONENT_CLASSIFICATION_LABELS[consolidated.classification as OpponentClassification]}
              </Badge>
            ) : consolidated.classificationTie ? (
              <span className="text-[11px] font-medium uppercase tracking-wider text-amber-600">
                Empate
              </span>
            ) : null
          }
        >
          <DistributionBars
            counts={consolidated.classificationCounts}
            labels={OPPONENT_CLASSIFICATION_LABELS as Record<string, string>}
            winner={consolidated.classificationTie ? null : consolidated.classification}
          />
        </Section>

        <Section
          title="Estilo predominante"
          winnerBadge={
            !empty && consolidated.style && !consolidated.styleTie ? (
              <Badge variant="outline" className="font-medium">
                {OPPONENT_STYLE_LABELS[consolidated.style as OpponentStyle]}
              </Badge>
            ) : consolidated.styleTie ? (
              <span className="text-[11px] font-medium uppercase tracking-wider text-amber-600">
                Empate
              </span>
            ) : null
          }
        >
          <DistributionBars
            counts={consolidated.styleCounts}
            labels={OPPONENT_STYLE_LABELS as Record<string, string>}
            winner={consolidated.styleTie ? null : consolidated.style}
          />
        </Section>

        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Confiança</span>
            <div className="flex gap-0.5">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    i <= confidence.dots ? confidence.color : "bg-muted-foreground/20",
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-semibold">{empty ? "—" : confidence.label}</span>
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {consolidated.notesUsed} {consolidated.notesUsed === 1 ? "nota" : "notas"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  winnerBadge,
  children,
}: {
  title: string;
  winnerBadge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
        {winnerBadge}
      </div>
      {children}
    </div>
  );
}
