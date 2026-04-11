"use client";

import { memo } from "react";
import { Bell } from "lucide-react";

const AlertsEmptyState = memo(function AlertsEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-blue-500/10 py-16 text-center text-muted-foreground">
      <Bell className="mx-auto mb-3 h-10 w-10 opacity-30" />
      <p className="text-sm">Nenhum alerta com os filtros atuais.</p>
    </div>
  );
});

AlertsEmptyState.displayName = "AlertsEmptyState";

export default AlertsEmptyState;
