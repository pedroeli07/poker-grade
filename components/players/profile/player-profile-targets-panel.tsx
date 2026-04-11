import Link from "next/link";
import { Target } from "lucide-react";
import { TARGET_STATUS_CONFIG } from "@/lib/constants";
import type { PlayerProfileRecord } from "@/lib/types";
import { memo } from "react";

const PlayerProfileTargetsPanel = memo(function PlayerProfileTargetsPanel({
  targets,
}: {
  targets: PlayerProfileRecord["targets"];
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Targets</h3>
        <Link href="/dashboard/targets" className="text-xs text-primary hover:underline">
          Ver todos
        </Link>
      </div>

      {targets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground bg-blue-500/10">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum target definido.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {targets.map((target) => {
            const cfg = TARGET_STATUS_CONFIG[target.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={target.id}
                className="flex items-center justify-between rounded-lg border-2 border-border/60 bg-card/50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{target.name}</p>
                  <p className="text-xs text-muted-foreground">{target.category}</p>
                  {target.targetType === "NUMERIC" && target.numericValue != null && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-muted-foreground">Meta:</span>
                      <span className="text-xs font-semibold">
                        {target.numericCurrent ?? "—"} / {target.numericValue}
                        {target.unit && <span className="text-muted-foreground ml-0.5">{target.unit}</span>}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-1 shrink-0 ml-2 ${cfg.color}`}>
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-xs font-medium hidden sm:block">{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

PlayerProfileTargetsPanel.displayName = "PlayerProfileTargetsPanel";

export default PlayerProfileTargetsPanel;
