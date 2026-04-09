import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TargetListRow } from "@/lib/types";
import { STATUS_CONFIG, LIMIT_ACTION_LABEL } from "@/lib/constants";
import { progressLabel } from "@/lib/utils";

export function TargetCard({ target }: { target: TargetListRow }) {
  const cfg = STATUS_CONFIG[target.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = cfg.icon;
  const limitCfg = target.limitAction
    ? LIMIT_ACTION_LABEL[target.limitAction as keyof typeof LIMIT_ACTION_LABEL]
    : null;

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 space-y-1.5 flex-1">
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-semibold text-sm leading-tight">{target.name}</span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-border/50 shrink-0"
          >
            {target.category}
          </Badge>
        </div>
        {limitCfg && (
          <span className={`text-xs block ${limitCfg.color}`}>
            Gatilho: {limitCfg.label}
          </span>
        )}
        <p className="text-xs text-muted-foreground">
          Jogador:{" "}
          <Link
            href={`/dashboard/players/${target.playerId}`}
            className="hover:text-primary font-medium text-foreground"
          >
            {target.playerName}
          </Link>
        </p>
        {target.targetType === "NUMERIC" && target.numericValue != null ? (
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-0">
              {target.numericCurrent != null && target.numericValue > 0 && (
                <div
                  className={`h-full rounded-full ${
                    target.status === "ON_TRACK"
                      ? "bg-emerald-500"
                      : target.status === "ATTENTION"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (target.numericCurrent / target.numericValue) * 100
                      )
                    )}%`,
                  }}
                />
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
              <strong className="text-foreground">
                {target.numericCurrent ?? "—"}
              </strong>
              {" / "}
              {target.numericValue}
              {target.unit && <span className="ml-0.5">{target.unit}</span>}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground tabular-nums pt-0.5">
            {progressLabel(target)}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground/80 pt-0.5">
          Meta definida pelo coach para o ciclo atual.
        </p>
      </div>
      <div
        className={`flex items-center gap-1.5 border ${cfg.bg} px-2 py-1 rounded-lg shrink-0`}
      >
        <StatusIcon className="h-4 w-4" />
        <span className="text-xs font-semibold hidden sm:block">
          {cfg.label}
        </span>
      </div>
    </div>
  );
}
