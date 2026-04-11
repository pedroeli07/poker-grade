import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ACTION_CONFIG } from "@/lib/constants";
import type { HistoryPageData } from "@/lib/history/history-page-load";
import { memo } from "react";

const TIMELINE_CARD_CLS =
  "bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]";

const HistoryTimeline = memo(function HistoryTimeline({ history }: Pick<HistoryPageData, "history">) {
  return (
    <Card className={TIMELINE_CARD_CLS}>
      <CardHeader>
        <CardTitle>Linha do Tempo</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
            <History className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Nenhuma alteração de limite registrada.</p>
          </div>
        ) : (
          <div className="relative space-y-0">
            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />

            {history.map((item) => {
              const cfg = ACTION_CONFIG[item.action];
              const ActionIcon = cfg.icon;
              return (
                <div key={item.id} className="relative flex gap-4 pb-5 last:pb-0">
                  <div
                    className={`relative z-10 flex items-center justify-center w-[34px] h-[34px] rounded-full border-2 shrink-0 bg-background ${
                      item.action === "UPGRADE"
                        ? "border-emerald-500/50"
                        : item.action === "DOWNGRADE"
                          ? "border-red-500/50"
                          : "border-border"
                    }`}
                  >
                    <ActionIcon className={`h-3.5 w-3.5 ${cfg.color}`} />
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${cfg.bg}`}>{cfg.label}</Badge>
                          <span className="font-medium text-sm">{item.player.name}</span>
                          {item.player.nickname && (
                            <span className="text-xs text-muted-foreground">@{item.player.nickname}</span>
                          )}
                        </div>

                        {item.fromGrade && item.toGrade && (
                          <div className="flex items-center gap-2 mt-1.5 text-sm">
                            <span className="text-muted-foreground text-xs">{item.fromGrade}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-xs font-medium">{item.toGrade}</span>
                          </div>
                        )}

                        {item.reason && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{item.reason}</p>
                        )}
                      </div>

                      <time className="text-xs text-muted-foreground shrink-0">
                        {format(item.createdAt, "dd MMM yyyy", { locale: ptBR })}
                      </time>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

HistoryTimeline.displayName = "HistoryTimeline";

export default HistoryTimeline;
