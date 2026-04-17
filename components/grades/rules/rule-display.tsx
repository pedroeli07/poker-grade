import { GradeRuleCardRule } from "@/lib/types";
import { DollarSign, Timer, Zap, Users, Tag, CalendarDays, TrendingUp, Clock } from "lucide-react";
import { memo } from "react";
import BuyInRange from "./buy-in-range";
import Pills from "./pills";

const labelClass = "mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground";

const RuleDisplay = memo(function RuleDisplay({ rule }: { rule: GradeRuleCardRule }) {
  return (
    <div className="space-y-2.5 text-[13px]">
      {/* Três colunas em desktop: buy-in | config | aux — altura mais uniforme */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-4">
        <section className="space-y-1.5 lg:col-span-4">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            <DollarSign className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            Buy-in ($)
          </div>
          <BuyInRange min={rule.buyInMin} max={rule.buyInMax} />
        </section>

        <section className="space-y-1.5 lg:col-span-4">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            <Timer className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            Configurações
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-x-3">
            <div>
              <div className={labelClass}>Velocidade</div>
              <Pills items={rule.speed} />
            </div>
            <div>
              <div className={labelClass}>Tipo de torneio</div>
              <Pills items={rule.tournamentType} />
            </div>
          </div>
        </section>

        <section className="space-y-1.5 sm:col-span-2 lg:col-span-4">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            <Zap className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            Regras auxiliares
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <div>
              <div className={labelClass}>Site / rede</div>
              <Pills items={rule.sites} />
            </div>
            <div>
              <div className={labelClass}>Variante</div>
              <Pills items={rule.variant} />
            </div>
            <div>
              <div className={labelClass}>Game type</div>
              <Pills items={rule.gameType} />
            </div>
            {(rule.autoOnly || rule.manualOnly) && (
              <div>
                <div className={labelClass}>Inscrição</div>
                <div className="flex flex-wrap gap-1.5">
                  {rule.autoOnly && (
                    <span className="inline-flex items-center rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-600">
                      Apenas automático
                    </span>
                  )}
                  {rule.manualOnly && (
                    <span className="inline-flex items-center rounded border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-violet-600">
                      Apenas manual
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-md border border-border/50 bg-muted/25 p-2 sm:grid-cols-3">
        <div>
          <div className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Users className="h-3 w-3" /> Mesas max
          </div>
          {rule.playerCount.length > 0 ? (
            <Pills items={rule.playerCount} />
          ) : (
            <span className="text-xs font-medium text-muted-foreground">—</span>
          )}
        </div>
        <div className="min-w-0 sm:col-span-1">
          <div className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Tag className="h-3 w-3" /> Excluir texto
          </div>
          <div className="truncate text-xs font-medium text-foreground" title={rule.excludePattern || undefined}>
            {rule.excludePattern || "—"}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <CalendarDays className="h-3 w-3" /> Dia
          </div>
          {rule.weekDay.length > 0 ? (
            <Pills items={rule.weekDay} />
          ) : (
            <span className="text-xs font-medium text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {(rule.prizePoolMin != null ||
        rule.prizePoolMax != null ||
        rule.minParticipants != null ||
        rule.fromTime != null ||
        rule.toTime != null ||
        rule.timezone != null) && (
        <div className="flex flex-wrap gap-2 rounded-md border border-blue-500/20 bg-blue-500/[0.06] p-2">
          {rule.prizePoolMin != null || rule.prizePoolMax != null ? (
            <div className="min-w-[100px] flex-1">
              <div className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-blue-500" /> Prize pool GTD
              </div>
              <div className="text-xs font-semibold tabular-nums text-blue-600">
                ${rule.prizePoolMin ?? "0"} – ${rule.prizePoolMax ?? "∞"}
              </div>
            </div>
          ) : null}
          {rule.minParticipants != null ? (
            <div className="min-w-[80px] flex-1">
              <div className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <Users className="h-3 w-3 text-blue-500" /> Mín. jogadores
              </div>
              <div className="text-xs font-medium">{rule.minParticipants}</div>
            </div>
          ) : null}
          {rule.fromTime != null || rule.toTime != null ? (
            <div className="min-w-[120px] flex-[2]">
              <div className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <Clock className="h-3 w-3 text-blue-500" /> Horário
              </div>
              <div className="text-xs font-medium">
                {rule.fromTime ?? "00:00"} – {rule.toTime ?? "23:59"}
                {rule.timezone != null && ` (UTC${rule.timezone >= 0 ? "+" : ""}${rule.timezone})`}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
});

RuleDisplay.displayName = "RuleDisplay";

export default RuleDisplay;
