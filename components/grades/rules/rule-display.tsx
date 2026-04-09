import { GradeRuleCardRule, LobbyzeFilterItem } from "@/lib/types";
import { DollarSign, Timer, Zap, Users, Tag, CalendarDays, TrendingUp, Clock } from "lucide-react";

function Pills({ items }: { items: LobbyzeFilterItem[] }) {
  if (!items.length)
    return <span className="text-muted-foreground/50 text-sm">Todos</span>;

  const pillClass = "bg-blue-500/12 text-blue-600 border-blue-500/25";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${pillClass}`}
        >
          {item.item_text}
        </span>
      ))}
    </div>
  );
}

function BuyInRange({
  min,
  max,
}: {
  min: number | null;
  max: number | null;
}) {
  if (!min && !max)
    return <span className="text-muted-foreground/50 text-sm">Sem restrição</span>;

  const pct = min && max ? ((min / max) * 100).toFixed(0) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-lg font-bold text-blue-400">
          ${min ?? "—"}
        </span>
        <span className="text-muted-foreground/60">—</span>
        <span className="font-mono text-lg font-bold text-blue-400">
          ${max ?? "—"}
        </span>
      </div>
      {min && max && (
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden w-full max-w-[140px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
            style={{ width: `${100 - Number(pct)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function RuleDisplay({ rule }: { rule: GradeRuleCardRule }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border/40 pb-1">
          <DollarSign className="h-4 w-4 text-blue-500" />
          Buy-In ($)
        </div>
        <BuyInRange min={rule.buyInMin} max={rule.buyInMax} />

        <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border/40 pb-1 pt-2">
          <Timer className="h-4 w-4 text-blue-500" />
          Configurações
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Velocidade
            </div>
            <Pills items={rule.speed} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Tipo de Torneio
            </div>
            <Pills items={rule.tournamentType} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border/40 pb-1">
          <Zap className="h-4 w-4 text-blue-500" />
          Regras Auxiliares
        </div>
        <div className="space-y-3">
          <div>
             <div className="text-xs text-muted-foreground mb-1">
               Site / Rede
             </div>
             <Pills items={rule.sites} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Variante
            </div>
            <Pills items={rule.variant} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Game Type
            </div>
            <Pills items={rule.gameType} />
          </div>
          {(rule.autoOnly || rule.manualOnly) && (
            <div>
               <div className="text-xs text-muted-foreground mb-1">
                Flags de Inscrição
               </div>
               <div className="flex gap-2">
                 {rule.autoOnly && (
                   <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500">
                     Apenas Automático
                   </span>
                 )}
                 {rule.manualOnly && (
                   <span className="inline-flex items-center rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-500">
                     Apenas Manual
                   </span>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-full">
        <div className="flex flex-wrap gap-x-8 gap-y-4 rounded-lg bg-muted/20 border border-border/50 p-4">
          <div className="flex-1 min-w-[120px]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
              <Users className="h-3.5 w-3.5" /> Mesas Max
            </div>
            {rule.playerCount.length > 0 ? (
              <Pills items={rule.playerCount} />
            ) : (
              <span className="text-sm font-medium">—</span>
            )}
          </div>
          <div className="flex-1 min-w-[120px]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
              <Tag className="h-3.5 w-3.5" /> Palavras Excluídas
            </div>
            <div className="text-sm font-medium text-foreground">
              {rule.excludePattern || "—"}
            </div>
          </div>
          <div className="flex-1 min-w-[120px]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
              <CalendarDays className="h-3.5 w-3.5" /> Dia da Semana
            </div>
            {rule.weekDay.length > 0 ? (
              <Pills items={rule.weekDay} />
            ) : (
              <span className="text-sm font-medium">—</span>
            )}
          </div>
        </div>
      </div>
      {(rule.prizePoolMin != null || rule.prizePoolMax != null || rule.minParticipants != null || rule.fromTime != null || rule.toTime != null || rule.timezone != null) && (
        <div className="col-span-full">
           <div className="flex flex-wrap gap-x-8 gap-y-4 rounded-lg bg-blue-500/5 border border-blue-500/20 p-4">
               {rule.prizePoolMin != null || rule.prizePoolMax != null ? (
                 <div className="flex-1 min-w-[120px]">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Prize Pool GTD
                    </div>
                    <div className="text-sm font-medium text-blue-400">
                      ${rule.prizePoolMin ?? "0"} - ${rule.prizePoolMax ?? "∞"}
                    </div>
                </div>
               ): null}
                {rule.minParticipants != null ? (
                 <div className="flex-1 min-w-[120px]">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                      <Users className="h-3.5 w-3.5 text-blue-500" /> Mín. Jogadores
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {rule.minParticipants}
                    </div>
                </div>
               ): null}
               {rule.fromTime != null || rule.toTime != null ? (
                 <div className="flex-1 min-w-[120px]">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                      <Clock className="h-3.5 w-3.5 text-blue-500" /> Horário Permitido
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {rule.fromTime ?? "00:00"} até {rule.toTime ?? "23:59"}
                      {rule.timezone != null && ` (UTC${rule.timezone >= 0 ? '+' : ''}${rule.timezone})`}
                    </div>
                </div>
               ): null}
           </div>
        </div>
      )}
    </div>
  );
}
