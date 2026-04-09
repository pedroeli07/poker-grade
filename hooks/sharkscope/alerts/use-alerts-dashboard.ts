"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import type { SharkscopeAlertRow } from "@/lib/types";
import { countUnacknowledgedAlerts, filterSharkscopeAlerts } from "@/lib/utils";

export function useAlertsDashboard(initialAlerts: SharkscopeAlertRow[]) {
  const [alerts, setAlerts] = useState<SharkscopeAlertRow[]>(initialAlerts);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterAck, setFilterAck] = useState("unacknowledged");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      filterSharkscopeAlerts(alerts, {
        severity: filterSeverity,
        alertType: filterType,
        ack: filterAck,
      }),
    [alerts, filterSeverity, filterType, filterAck]
  );

  const unackedCount = useMemo(
    () => countUnacknowledgedAlerts(filtered),
    [filtered]
  );

  const acknowledge = useCallback(
    (id: string) => {
      startTransition(async () => {
        const res = await fetch(`/api/alerts/${id}/acknowledge`, {
          method: "POST",
        });
        if (!res.ok) {
          toast.error("Erro", "Não foi possível reconhecer o alerta.");
          return;
        }
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  acknowledged: true,
                  acknowledgedAt: new Date().toISOString(),
                }
              : a
          )
        );
      });
    },
    [startTransition]
  );

  const acknowledgeAll = useCallback(() => {
    const unacked = filtered.filter((a) => !a.acknowledged);
    startTransition(async () => {
      await Promise.all(
        unacked.map((a) =>
          fetch(`/api/alerts/${a.id}/acknowledge`, { method: "POST" })
        )
      );
      const ids = new Set(unacked.map((a) => a.id));
      setAlerts((prev) =>
        prev.map((a) =>
          ids.has(a.id)
            ? {
                ...a,
                acknowledged: true,
                acknowledgedAt: new Date().toISOString(),
              }
            : a
        )
      );
      toast.success(
        "Alertas reconhecidos",
        `${unacked.length} alertas foram reconhecidos.`
      );
    });
  }, [filtered, startTransition]);

  return {
    filterSeverity,
    setFilterSeverity,
    filterType,
    setFilterType,
    filterAck,
    setFilterAck,
    filtered,
    unackedCount,
    isPending,
    acknowledge,
    acknowledgeAll,
  };
}
