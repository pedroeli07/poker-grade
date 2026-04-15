"use client";

import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { POKER_NETWORKS } from "@/lib/constants";
import type { PokerNetworkKey, SharkscopeScoutingSavedCardProps } from "@/lib/types";
import ScoutingRoiDisplay from "@/components/sharkscope/scouting/scouting-roi-display";
import ScoutingStatCard from "@/components/sharkscope/scouting/scounting-stat-card";
import { parseScoutingSavedRaw } from "@/lib/utils";

export const ScoutingSavedCard = memo(function ScoutingSavedCard({
  analysis,
  expanded,
  isPending,
  onToggle,
  onDelete,
}: SharkscopeScoutingSavedCardProps) {
  const stats = useMemo(
    () => parseScoutingSavedRaw(analysis.rawData),
    [analysis.rawData]
  );

  const abiVal = stats.abi;
  const countVal = stats.count;

  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <span className="font-semibold">{analysis.nick}</span>
              <Badge variant="outline" className="ml-2 text-xs">
                {POKER_NETWORKS[analysis.network as PokerNetworkKey]?.label ??
                  analysis.network}
              </Badge>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <ScoutingRoiDisplay roi={stats.roi} />
              {stats.profit !== null && (
                <span
                  className={`font-mono font-semibold text-xs ${stats.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}
                >
                  {stats.profit >= 0 ? "+" : ""}${stats.profit.toFixed(0)}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground hidden md:block">
              {format(new Date(analysis.createdAt), "dd/MM/yy", { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              type="button"
              onClick={() => onToggle(analysis.id)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              type="button"
              disabled={isPending}
              onClick={() => onDelete(analysis.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <ScoutingStatCard label="ROI" value={<ScoutingRoiDisplay roi={stats.roi} />} />
              <ScoutingStatCard
                label="Lucro"
                value={
                  stats.profit !== null ? `$${stats.profit.toFixed(0)}` : "—"
                }
              />
              <ScoutingStatCard
                label="Volume"
                value={countVal !== null ? countVal.toFixed(0) : "—"}
              />
              <ScoutingStatCard
                label="ABI"
                value={abiVal !== null ? `$${abiVal.toFixed(0)}` : "—"}
              />
            </div>
            {analysis.notes && (
              <p className="text-sm text-muted-foreground italic">{analysis.notes}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
