import { TARGET_STATUS_CONFIG } from "@/lib/constants/target";
import type { PlayerProfileRecord } from "@/lib/types/player/index";
export function MinhaGradeTargets({ targets }: { targets: PlayerProfileRecord["targets"] }) {
  return (
    <div id="meus-targets">
      <div className="flex items-center gap-4 mb-5">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-3">
          Meus targets
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {targets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-muted-foreground text-sm">
          Nenhum target ativo no momento. Seu coach pode cadastrar metas
          para você acompanhar.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {targets.map((target) => {
            const cfg = TARGET_STATUS_CONFIG[target.status as keyof typeof TARGET_STATUS_CONFIG];
            const StatusIcon = cfg.icon;
            const pct =
              target.numericValue && target.numericCurrent !== null
                ? Math.min(
                    100,
                    Math.round(
                      (target.numericCurrent / target.numericValue) * 100
                    )
                  )
                : null;

            return (
              <div
                key={target.id}
                className="rounded-xl border border-border bg-card p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[15px] text-foreground">
                      {target.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {target.category}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 ${cfg.color}`}>
                    <StatusIcon className="h-5 w-5" />
                    <span className="text-sm font-semibold">{cfg.label}</span>
                  </div>
                </div>

                {target.targetType === "NUMERIC" &&
                  target.numericValue != null && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Atual</span>
                        <span className="font-bold text-foreground">
                          {target.numericCurrent ?? "?"}
                          {target.unit && (
                            <span className="text-muted-foreground ml-0.5 font-normal">
                              {target.unit}
                            </span>
                          )}{" "}
                          <span className="text-muted-foreground font-normal">
                            / {target.numericValue}
                            {target.unit}
                          </span>
                        </span>
                      </div>
                      {pct !== null && (
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              target.status === "ON_TRACK"
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                : target.status === "ATTENTION"
                                  ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                  : "bg-gradient-to-r from-red-500 to-red-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                      {pct !== null && (
                        <p className="text-xs text-right text-muted-foreground">
                          {pct}%
                        </p>
                      )}
                    </div>
                  )}

                {target.coachNotes && (
                  <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
                    {target.coachNotes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
