import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History } from "lucide-react";
import { LIMIT_ACTION_CONFIG } from "@/lib/constants/grade";
import type { PlayerProfileRecord } from "@/lib/types/player/index";
import { memo } from "react";

const PlayerProfileLimitHistory = memo(function PlayerProfileLimitHistory({
  limitChanges,
}: {
  limitChanges: PlayerProfileRecord["limitChanges"];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">Histórico de Limites</h3>
      </div>

      {limitChanges.length === 0 ? (
        <p className="text-sm text-muted-foreground bg-blue-500/10 rounded-lg p-4">Nenhuma alteração registrada.</p>
      ) : (
        <div className="space-y-2">
          {limitChanges.map((change) => {
            const cfg = LIMIT_ACTION_CONFIG[change.action];
            const ActionIcon = cfg.icon;
            return (
              <div key={change.id} className="flex items-start gap-2.5 text-sm">
                <ActionIcon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                    {change.fromGrade && change.toGrade && (
                      <span className="text-xs text-muted-foreground">
                        {change.fromGrade} → {change.toGrade}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(change.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                    {change.reason && ` · ${change.reason}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

PlayerProfileLimitHistory.displayName = "PlayerProfileLimitHistory";

export default PlayerProfileLimitHistory;
