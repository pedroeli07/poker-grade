"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Square } from "lucide-react";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { ErrorTypes } from "@/lib/types/primitives";
import type { SharkscopeSyncJson, SharkScopeSyncMode } from "@/lib/types/sharkScopeTypes";
import { createLogger } from "@/lib/logger";

const log = createLogger("sharkscope.sync-button");

export function SyncSharkScopeButton({ syncMode = "full" }: { syncMode?: SharkScopeSyncMode }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  function onCancel() {
    log.info("Cancelar clicado — abort() no AbortController", { syncMode });
    abortRef.current?.abort();
    log.info("Sincronização interrompida pelo utilizador", { syncMode });
  }

  async function onSync() {
    if (isPending) {
      log.debug("onSync ignorado — já em progresso", { syncMode });
      return;
    }
    const startedAt = performance.now();
    log.info("Sincronização iniciada", { syncMode });
    const ac = new AbortController();
    abortRef.current = ac;
    setIsPending(true);

    try {
      log.info("POST /api/sharkscope/sync", { syncMode, signalActive: !ac.signal.aborted });
      const res = await fetch("/api/sharkscope/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncMode }),
        signal: ac.signal,
        credentials: "same-origin",
      });

      const networkMs = Math.round(performance.now() - startedAt);
      log.info("Resposta HTTP recebida", {
        syncMode,
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        networkMs,
        contentType: res.headers.get("content-type"),
      });

      let data: SharkscopeSyncJson;
      try {
        data = (await res.json()) as SharkscopeSyncJson;
      } catch (parseErr) {
        const cause = parseErr instanceof Error ? parseErr : new Error(String(parseErr));
        log.error("Corpo da resposta não é JSON válido", cause, {
          syncMode,
          status: res.status,
          contentType: res.headers.get("content-type"),
          networkMs,
        });
        toast.error("Erro na sincronização", "Resposta inválida do servidor");
        return;
      }

      log.info("Payload JSON parseado", {
        syncMode,
        ok: data.ok,
        processed: data.processed,
        errors: data.errors,
        sharkHttpCalls: data.sharkHttpCalls,
        remainingSearches: data.remainingSearches,
        cancelled: data.cancelled,
        error: data.error,
      });

      if (!res.ok) {
        const msg = data.error ?? `HTTP ${res.status}`;
        toast.error("Erro na sincronização", msg);
        log.error("API devolveu erro HTTP", new Error(msg), {
          syncMode,
          httpStatus: res.status,
          data,
        });
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
        log.info("Sincronização cancelada (flag cancelled)", {
          syncMode,
          sharkHttpCalls: data.sharkHttpCalls,
          remainingSearches: data.remainingSearches,
          processed: data.processed,
          errors: data.errors,
          totalMs: Math.round(performance.now() - startedAt),
        });
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
      log.info("Sincronização concluída com sucesso", {
        syncMode,
        sharkHttpCalls: data.sharkHttpCalls,
        remainingSearches: data.remainingSearches,
        processed: data.processed,
        errors: data.errors,
        totalMs: Math.round(performance.now() - startedAt),
      });
      router.refresh();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        log.info("Fetch abortado (AbortError)", { syncMode, totalMs: Math.round(performance.now() - startedAt) });
        toast.info("Sincronização interrompida", ErrorTypes.SHARK_SYNC_CANCELLED);
        router.refresh();
        return;
      }
      const cause = e instanceof Error ? e : new Error(String(e));
      log.error("Exceção durante sincronização", cause, { syncMode });
      toast.error("Erro na sincronização", cause.message || ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR);
    } finally {
      abortRef.current = null;
      setIsPending(false);
      log.debug("onSync finalizado (estado limpo)", { syncMode });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      <Button
        variant="outline"
        onClick={onSync}
        disabled={isPending}
        className="gap-2 bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-200"
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
