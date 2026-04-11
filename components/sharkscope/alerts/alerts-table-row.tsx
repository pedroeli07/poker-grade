"use client";

import { memo } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { ALERT_TYPE_LABEL, SEVERITY_UI } from "@/lib/constants";
import type { SharkscopeAlertRow } from "@/lib/types";
import {
  formatAlertMetricValue,
  formatAlertThreshold,
  formatAlertTriggeredAt,
  getAlertMetricBadgeProps,
} from "@/lib/utils";

const AlertsTableRow = memo(function AlertsTableRow({
  alert,
  canAcknowledge,
  isSelected,
  isPending,
  onToggleSelect,
  onAcknowledge,
}: {
  alert: SharkscopeAlertRow;
  canAcknowledge: boolean;
  isSelected: boolean;
  isPending: boolean;
  onToggleSelect: (id: string, selected: boolean) => void;
  onAcknowledge: (id: string) => void;
}) {
  const sev = SEVERITY_UI[alert.severity] ?? SEVERITY_UI.yellow;
  const valueBadge = getAlertMetricBadgeProps(alert);

  return (
    <TableRow
      className={`bg-white hover:bg-sidebar-accent/50 ${alert.acknowledged ? "opacity-50" : ""}`}
    >
      {canAcknowledge && (
        <TableCell className="w-11 min-w-11 max-w-11 !p-2 !px-1.5 align-middle">
          <div className="flex justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(v) => onToggleSelect(alert.id, v === true)}
              disabled={isPending}
              aria-label={`Selecionar alerta: ${alert.player.name}`}
              className="size-4 border-2 border-foreground/35 bg-background shadow-sm hover:border-primary/70 data-[state=checked]:border-primary"
            />
          </div>
        </TableCell>
      )}
      <TableCell>
        <Badge className={`${sev.badge} text-xs`}>
          <AlertTriangle className={`mr-1 h-3 w-3 ${sev.iconClass}`} />
          {sev.label}
        </Badge>
      </TableCell>
      <TableCell>
        <Link
          href={`/dashboard/players/${alert.player.id}`}
          className="font-medium transition-colors hover:text-primary"
        >
          {alert.player.name}
        </Link>
        {alert.player.nickname && (
          <span className="ml-1 text-xs text-muted-foreground">@{alert.player.nickname}</span>
        )}
      </TableCell>
      <TableCell className="text-sm">
        <Badge
          variant="outline"
          className="max-w-full truncate border-border/80 bg-muted/40 font-normal text-foreground"
        >
          {ALERT_TYPE_LABEL[alert.alertType] ?? alert.alertType}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={valueBadge.variant} className={valueBadge.className}>
          {formatAlertMetricValue(alert)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="font-mono text-xs font-medium tabular-nums text-muted-foreground"
        >
          {formatAlertThreshold(alert)}
        </Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatAlertTriggeredAt(alert.triggeredAt)}
      </TableCell>
      {canAcknowledge && (
        <TableCell className="text-right">
          {alert.acknowledged ? (
            <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              OK
            </span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              disabled={isPending}
              onClick={() => onAcknowledge(alert.id)}
            >
              Reconhecer
            </Button>
          )}
        </TableCell>
      )}
    </TableRow>
  );
});

AlertsTableRow.displayName = "AlertsTableRow";

export default AlertsTableRow;
