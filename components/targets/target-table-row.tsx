import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { TargetListViewModel } from "@/lib/utils/target/target-utils";
import { memo } from "react";

const TargetTableRow = memo(function TargetTableRow({ vm }: { vm: TargetListViewModel }) {
  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="font-medium align-top py-4">
        <div className="space-y-1">
          <span className="block leading-tight">{vm.name}</span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-border/50"
          >
            {vm.category}
          </Badge>
          {vm.hasLimitAction && (
            <span className={`text-[11px] block mt-1 ${vm.limitActionColor}`}>
              Gatilho: {vm.limitActionLabel}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="align-top py-4">
        <Link
          href={`/dashboard/players/${vm.playerId}`}
          className="hover:text-primary font-medium transition-colors"
        >
          {vm.playerName}
        </Link>
      </TableCell>
      <TableCell className="align-top py-4">
        {vm.isNumeric ? (
          <div className="space-y-1.5 max-w-[200px]">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              {vm.showTableProgressBar && (
                <div
                  className={`h-full rounded-full ${vm.progressColor}`}
                  style={{ width: `${vm.progressPercent}%` }}
                />
              )}
            </div>
            <div className="flex items-center justify-between text-xs tabular-nums">
              <span className="font-bold text-foreground">
                {vm.progressCurrent}
              </span>
              <span className="text-muted-foreground">
                / {vm.progressTotal}
                {vm.progressUnit && <span className="ml-0.5">{vm.progressUnit}</span>}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground tabular-nums">
            {vm.textCurrent ?? "—"} / {vm.textValue ?? "—"}
          </span>
        )}
      </TableCell>
      <TableCell className="align-top py-4 text-right pr-4">
        <div
          className={`inline-flex items-center justify-end gap-1.5 border ${vm.statusConfig.bg} px-2.5 py-1 rounded-lg shrink-0`}
        >
          <vm.statusConfig.icon className="h-4 w-4" />
          <span className="text-xs font-semibold">{vm.statusConfig.label}</span>
        </div>
      </TableCell>
    </TableRow>
  );
});

TargetTableRow.displayName = "TargetTableRow";

export default TargetTableRow;