"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { SyncSharkScopeButton } from "@/components/sharkscope/sync-button";

const AlertsPageHeader = memo(function AlertsPageHeader({
  canAcknowledge,
  unackedCount,
  isPending,
  onAcknowledgeAll,
}: {
  canAcknowledge: boolean;
  unackedCount: number;
  isPending: boolean;
  onAcknowledgeAll: () => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Alertas SharkScope</h2>
        <p className="mt-1 text-muted-foreground">Alertas automáticos gerados pelo cron job diário.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {canAcknowledge && <SyncSharkScopeButton syncMode="players" />}
        {canAcknowledge && unackedCount > 0 && (
          <Button variant="outline" size="sm" disabled={isPending} onClick={onAcknowledgeAll}>
            {isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Reconhecer todos ({unackedCount})
          </Button>
        )}
      </div>
    </div>
  );
});

AlertsPageHeader.displayName = "AlertsPageHeader";

export default AlertsPageHeader;
