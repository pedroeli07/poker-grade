"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Square } from "lucide-react";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { ErrorTypes } from "@/lib/types";

type SyncJson = {
  ok?: boolean;
  processed?: number;
  errors?: number;
  sharkHttpCalls?: number;
  remainingSearches?: number | null;
  cancelled?: boolean;
  error?: string;
};

export function SyncSharkScopeButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  function onCancel() {
    abortRef.current?.abort();
  }

  async function onSync() {
    if (isPending) return;
    const ac = new AbortController();
    abortRef.current = ac;
    setIsPending(true);
    try {
      const res = await fetch("/api/sharkscope/sync", {
        method: "POST",
        signal: ac.signal,
        credentials: "same-origin",
      });
      const data = (await res.json()) as SyncJson;

      if (!res.ok) {
        toast.error("Erro na sincronização", data.error ?? `HTTP ${res.status}`);
        return;
      }

      if (data.cancelled) {
        const rem =
          data.remainingSearches === null || data.remainingSearches === undefined
            ? "— (API não informou)"
            : String(data.remainingSearches);
        toast.info(
          "Sincronização cancelada",
          `Requisições HTTP até parar: ${data.sharkHttpCalls ?? 0} | Buscas restantes na conta: ${rem} | Jogadores processados: ${data.processed ?? 0} | Erros: ${data.errors ?? 0}`
        );
        router.refresh();
        return;
      }

      const rem =
        data.remainingSearches === null || data.remainingSearches === undefined
          ? "— (API não informou)"
          : String(data.remainingSearches);
      toast.success(
        "Sincronização concluída",
        `Requisições HTTP SharkScope: ${data.sharkHttpCalls ?? 0} | Buscas restantes na conta: ${rem} | Jogadores processados: ${data.processed ?? 0} | Erros: ${data.errors ?? 0}`
      );
      router.refresh();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        toast.info("Sincronização interrompida", ErrorTypes.SHARK_SYNC_CANCELLED);
        router.refresh();
        return;
      }
      toast.error("Erro na sincronização", e instanceof Error ? e.message : ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR);
    } finally {
      abortRef.current = null;
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      <Button
        variant="outline"
        onClick={onSync}
        disabled={isPending}
        className="gap-2 bg-blue-500/10 hover:bg-blue-500/20 hover:scale-105 transition-all duration-200"
      >
        <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Sincronizando..." : "Sincronizar SharkScope"}
      </Button>
      {isPending && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Square className="h-3.5 w-3.5 fill-current" />
          Cancelar
        </Button>
      )}
    </div>
  );
}
