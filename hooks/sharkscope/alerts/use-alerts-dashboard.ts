"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import type { SharkscopeAlertRow } from "@/lib/types";
import { countUnacknowledgedAlerts, filterSharkscopeAlerts } from "@/lib/utils";

import type { NumberFilterValue } from "@/lib/number-filter";

export function useAlertsDashboard(initialAlerts: SharkscopeAlertRow[]) {
  const [alerts, setAlerts] = useState<SharkscopeAlertRow[]>(initialAlerts);
  const [filterSeverity, setFilterSeverity] = useState<Set<string> | null>(null);
  const [filterType, setFilterType] = useState<Set<string> | null>(null);
  // Default to only unacknowledged to match original behavior where "unacknowledged" was the default string
  const [filterAck, setFilterAck] = useState<Set<string> | null>(() => new Set(["unacknowledged"]));
  const [filterPlayer, setFilterPlayer] = useState<Set<string> | null>(null);
  const [filterData, setFilterData] = useState<Set<string> | null>(null);
  const [filterValor, setFilterValor] = useState<NumberFilterValue | null>(null);
  const [filterLimite, setFilterLimite] = useState<NumberFilterValue | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      filterSharkscopeAlerts(alerts, {
        severity: filterSeverity,
        alertType: filterType,
        ack: filterAck,
        player: filterPlayer,
        data: filterData,
        valor: filterValor,
        limite: filterLimite,
      }),
    [alerts, filterSeverity, filterType, filterAck, filterPlayer, filterData, filterValor, filterLimite]
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

  const deleteAlerts = useCallback(
    (ids: string[], opts?: { onSuccess?: () => void }) => {
      const unique = [...new Set(ids)].filter(Boolean);
      if (unique.length === 0) return;
      startTransition(() => {
        void (async () => {
          const res = await fetch("/api/alerts/bulk-delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: unique }),
          });
          const body = (await res.json().catch(() => ({}))) as {
            deleted?: number;
            ids?: string[];
            error?: string;
          };
          if (!res.ok) {
            toast.error(
              "Erro ao excluir",
              typeof body.error === "string" ? body.error : "Não foi possível excluir os alertas."
            );
            return;
          }
          const removed = Array.isArray(body.ids) ? body.ids : unique;
          const n = typeof body.deleted === "number" ? body.deleted : removed.length;
          setAlerts((prev) => prev.filter((a) => !removed.includes(a.id)));
          if (n === 0) {
            toast.error("Nenhum alerta excluído", "Nada foi removido. Atualize a página se o problema persistir.");
            return;
          }
          toast.success(
            "Alertas excluídos",
            `${n} registro${n !== 1 ? "s" : ""} removido${n !== 1 ? "s" : ""}.`
          );
          opts?.onSuccess?.();
        })();
      });
    },
    [startTransition]
  );

  return {
    alerts,
    filterSeverity,
    setFilterSeverity,
    filterType,
    setFilterType,
    filterAck,
    setFilterAck,
    filterPlayer,
    setFilterPlayer,
    filterData,
    setFilterData,
    filterValor,
    setFilterValor,
    filterLimite,
    setFilterLimite,
    filtered,
    unackedCount,
    isPending,
    acknowledge,
    acknowledgeAll,
    deleteAlerts,
  };
}
