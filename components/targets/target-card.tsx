import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { TargetListViewModel } from "@/lib/utils/target/target-utils";

export function TargetCard({ vm }: { vm: TargetListViewModel }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 space-y-1.5 flex-1">
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-semibold text-sm leading-tight">{vm.name}</span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-border/50 shrink-0"
          >
            {vm.category}
          </Badge>
        </div>
        {vm.hasLimitAction && (
          <span className={`text-xs block ${vm.limitActionColor}`}>
            Gatilho: {vm.limitActionLabel}
          </span>
        )}
        <p className="text-xs text-muted-foreground">
          Jogador:{" "}
          <Link
            href={`/dashboard/players/${vm.playerId}`}
            className="hover:text-primary font-medium text-foreground"
          >
            {vm.playerName}
          </Link>
        </p>
        {vm.isNumeric ? (
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-0">
              {vm.showCardProgressBar && (
                <div
                  className={`h-full rounded-full ${vm.progressColor}`}
                  style={{ width: `${vm.progressPercent}%` }}
                />
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
              <strong className="text-foreground">{vm.progressCurrent}</strong>
              {" / "}
              {vm.progressTotal}
              {vm.progressUnit && <span className="ml-0.5">{vm.progressUnit}</span>}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground tabular-nums pt-0.5">
            {vm.textCurrent ?? "—"} / {vm.textValue ?? "—"}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground/80 pt-0.5">
          Meta definida pelo coach para o ciclo atual.
        </p>
      </div>
      <div className={`flex items-center gap-1.5 border ${vm.statusConfig.bg} px-2 py-1 rounded-lg shrink-0`}>
        <vm.statusConfig.icon className="h-4 w-4" />
        <span className="text-xs font-semibold hidden sm:block">
          {vm.statusConfig.label}
        </span>
      </div>
    </div>
  );
}
