"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, History, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ACTION_CONFIG } from "@/lib/constants/roles-actions";
import { TIMELINE_CARD_CLS } from "@/lib/constants/classes";
import { cn } from "@/lib/utils/cn";
import type { HistoryPageData } from "@/lib/data/history";
import { memo } from "react";

type Props = Pick<HistoryPageData, "history" | "isPlayer"> & {
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
};

const HistoryTimeline = memo(function HistoryTimeline({
  history,
  isPlayer,
  selected,
  onToggleSelect,
}: Props) {
  if (history.length === 0) {
    return (
      <Card className={TIMELINE_CARD_CLS}>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
            <History className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Nenhuma alteração de grade registrada.</p>
            <p className="text-xs mt-1 opacity-60">
              Alterações de grade aparecerão aqui quando forem realizadas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={TIMELINE_CARD_CLS}>
      <CardContent>
        <ul className="relative divide-y divide-border/60">
          {history.map((item) => {
            const cfg = ACTION_CONFIG[item.action];
            const ActionIcon = cfg.icon;
            const isSelected = selected.has(item.id);
            const borderColor =
              item.action === "UPGRADE"
                ? "border-emerald-500/40"
                : item.action === "DOWNGRADE"
                  ? "border-red-500/40"
                  : "border-amber-500/40";
            const arrowColor =
              item.action === "UPGRADE"
                ? "text-emerald-500"
                : item.action === "DOWNGRADE"
                  ? "text-red-500"
                  : "text-muted-foreground";

            return (
              <li
                key={item.id}
                className={cn(
                  "group relative flex items-start gap-3 py-2.5 px-2 rounded-md transition-colors",
                  isSelected
                    ? "bg-red-500/10 ring-1 ring-red-500/20"
                    : "hover:bg-muted/30"
                )}
              >
                <button
                  type="button"
                  onClick={() => onToggleSelect(item.id)}
                  aria-label={isSelected ? "Desmarcar" : "Selecionar"}
                  className={cn(
                    "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer",
                    isSelected
                      ? "bg-red-500 border-red-500"
                      : "border-border hover:border-primary/60"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </button>

                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-background",
                    borderColor
                  )}
                >
                  <ActionIcon className={cn("h-3.5 w-3.5", cfg.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Badge className={cn("text-xs px-2 py-0.5", cfg.bg)}>{cfg.label}</Badge>

                    {!isPlayer && (
                      <span className="text-[15px] font-medium text-foreground truncate">
                        {item.player.name}
                      </span>
                    )}
                    {!isPlayer && item.player.nickname && (
                      <span className="text-sm text-muted-foreground truncate">
                        @{item.player.nickname}
                      </span>
                    )}

                    {(item.fromGrade || item.toGrade) && (
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        {item.fromGrade && (
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded border",
                              item.action === "DOWNGRADE"
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                                : "bg-muted/50 border-border text-muted-foreground"
                            )}
                          >
                            {item.fromGrade}
                          </span>
                        )}
                        <ArrowRight className={cn("h-3 w-3 shrink-0", arrowColor)} />
                        {item.toGrade && (
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded border font-medium",
                              item.action === "UPGRADE"
                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600"
                                : item.action === "DOWNGRADE"
                                  ? "bg-red-500/10 border-red-500/25 text-red-600"
                                  : "bg-amber-500/10 border-amber-500/25 text-amber-600"
                            )}
                          >
                            {item.toGrade}
                          </span>
                        )}
                      </span>
                    )}

                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      ·{" "}
                      {format(item.createdAt, "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>

                  {(item.reason || (item.decidedByName && !isPlayer)) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-sm text-muted-foreground">
                      {item.reason && <span className="italic">“{item.reason}”</span>}
                      {item.decidedByName && !isPlayer && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                          <User className="h-3 w-3" />
                          por {item.decidedByName}
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
});

HistoryTimeline.displayName = "HistoryTimeline";

export default HistoryTimeline;
