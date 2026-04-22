import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { PlayerProfileRecord } from "@/lib/types/player/index";
export function MinhaGradeLimits({
  limitChanges,
}: {
  limitChanges: PlayerProfileRecord["limitChanges"];
}) {
  if (!limitChanges || limitChanges.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-3">
          Histórico de limites
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-3">
        {limitChanges.map((change) => {
          const isUp = change.action === "UPGRADE";
          const isDown = change.action === "DOWNGRADE";
          return (
            <div
              key={change.id}
              className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isUp
                    ? "bg-emerald-500/10"
                    : isDown
                      ? "bg-amber-500/10"
                      : "bg-muted"
                }`}
              >
                {isUp ? (
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                ) : isDown ? (
                  <TrendingDown className="h-5 w-5 text-amber-500" />
                ) : (
                  <Minus className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`font-semibold text-[15px] ${
                    isUp
                      ? "text-emerald-600"
                      : isDown
                        ? "text-amber-600"
                        : "text-foreground"
                  }`}
                >
                  {isUp ? "Promoção" : isDown ? "Ajuste" : "Mantido"}
                </p>
                {change.fromGrade && change.toGrade && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {change.fromGrade}{" "}
                    <span className="mx-1">→</span> {change.toGrade}
                  </p>
                )}
                {change.reason && (
                  <p className="text-sm text-muted-foreground/80 mt-1 italic">
                    {change.reason}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {new Date(change.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
