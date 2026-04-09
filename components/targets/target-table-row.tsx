import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { TargetListRow } from "@/lib/types";
import { STATUS_CONFIG, LIMIT_ACTION_LABEL } from "@/lib/constants";
import { progressLabel } from "@/lib/utils";

export function TargetTableRow({ target }: { target: TargetListRow }) {
  const cfg = STATUS_CONFIG[target.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = cfg.icon;
  const limitCfg = target.limitAction
    ? LIMIT_ACTION_LABEL[target.limitAction as keyof typeof LIMIT_ACTION_LABEL]
    : null;

  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="font-medium align-top py-4">
        <div className="space-y-1">
          <span className="block leading-tight">{target.name}</span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-border/50"
          >
            {target.category}
          </Badge>
          {limitCfg && (
            <span className={`text-[11px] block mt-1 ${limitCfg.color}`}>
              Gatilho: {limitCfg.label}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="align-top py-4">
        <Link
          href={`/dashboard/players/${target.playerId}`}
          className="hover:text-primary font-medium transition-colors"
        >
          {target.playerName}
        </Link>
      </TableCell>
      <TableCell className="align-top py-4">
        {target.targetType === "NUMERIC" && target.numericValue != null ? (
          <div className="space-y-1.5 max-w-[200px]">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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
            <div className="flex items-center justify-between text-xstabular-nums">
              <span className="font-bold text-foreground">
                {target.numericCurrent ?? "—"}
              </span>
              <span className="text-muted-foreground">
                / {target.numericValue}
                {target.unit && <span className="ml-0.5">{target.unit}</span>}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground tabular-nums">
            {progressLabel(target)}
          </span>
        )}
      </TableCell>
      <TableCell className="align-top py-4 text-right pr-4">
        <div
          className={`inline-flex items-center justify-end gap-1.5 border ${cfg.bg} px-2.5 py-1 rounded-lg shrink-0`}
        >
          <StatusIcon className="h-4 w-4" />
          <span className="text-xs font-semibold">{cfg.label}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
