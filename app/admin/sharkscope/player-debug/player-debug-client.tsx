"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { SyncSinglePlayerResult } from "./actions";
import { syncSharkScopeSinglePlayerAction } from "./actions";

type PlayerOpt = {
  api10d: boolean;
  api365d: boolean;
  apiLifetime: boolean;
  apiCtOnePage: boolean;
};

export function PlayerDebugClient({
  players,
  playerId,
  opts,
  children,
}: {
  players: { id: string; name: string; playerGroup: string }[];
  playerId: string;
  opts: PlayerOpt;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [syncResult, setSyncResult] = useState<SyncSinglePlayerResult | null>(null);
  const [pendingSyncMode, setPendingSyncMode] = useState<"full" | "light" | null>(null);

  function buildSearchUrl(pid: string): string {
    const p = new URLSearchParams();
    if (pid) p.set("player", pid);
    if (opts.api10d) p.set("api10d", "1");
    if (opts.api365d) p.set("api365d", "1");
    if (opts.apiLifetime) p.set("apiLife", "1");
    if (opts.apiCtOnePage) p.set("apiCt", "1");
    const q = p.toString();
    return q ? `/admin/sharkscope/player-debug?${q}` : "/admin/sharkscope/player-debug";
  }

  function handleCarregar() {
    const el = document.getElementById("player-debug-select") as HTMLSelectElement | null;
    const pid = el?.value ?? "";
    router.push(buildSearchUrl(pid));
  }

  function runSync(syncMode: "full" | "light") {
    const el = document.getElementById("player-debug-select") as HTMLSelectElement | null;
    const pid = el?.value?.trim() ?? "";
    if (!pid) {
      setSyncResult({ success: false, error: "Selecione um jogador." });
      return;
    }
    setSyncResult(null);
    setPendingSyncMode(syncMode);
    startTransition(async () => {
      try {
        const r = await syncSharkScopeSinglePlayerAction(pid, syncMode);
        setSyncResult(r);
        router.refresh();
        if (r.success) {
          router.push(buildSearchUrl(pid));
        }
      } finally {
        setPendingSyncMode(null);
      }
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="space-y-2">
          <Label htmlFor="player-debug-select">Jogador (ativo, com playerGroup)</Label>
          <select
            id="player-debug-select"
            name="player"
            defaultValue={playerId || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Selecione…</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.playerGroup})
              </option>
            ))}
          </select>
        </div>

        <details className="rounded-md border border-border/60 p-3">
          <summary className="cursor-pointer text-sm font-medium">
            Chamadas granulares (opcional — não é o fluxo do cron)
          </summary>
          <p className="mt-2 text-xs text-muted-foreground">
            Marque e use <strong>Carregar diagnóstico</strong> para testar endpoints isolados (10d, 365d,
            lifetime, 1 página de torneios). Isto <strong>não</strong> substitui o sync completo.
          </p>
          <fieldset className="mt-3 space-y-2">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                id="g-api10d"
                name="api10d"
                value="1"
                defaultChecked={opts.api10d}
                className="mt-0.5 h-4 w-4 rounded border border-input"
              />
              <span>
                <code className="text-xs">statistics</code> <code className="text-xs">Date:10D</code>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                id="g-api365d"
                name="api365d"
                value="1"
                defaultChecked={opts.api365d}
                className="mt-0.5 h-4 w-4 rounded border border-input"
              />
              <span>
                <code className="text-xs">statistics</code> <code className="text-xs">Date:365D</code>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                id="g-apiLife"
                name="apiLife"
                value="1"
                defaultChecked={opts.apiLifetime}
                className="mt-0.5 h-4 w-4 rounded border border-input"
              />
              <span>
                <code className="text-xs">statistics</code> lifetime
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                id="g-apiCt"
                name="apiCt"
                value="1"
                defaultChecked={opts.apiCtOnePage}
                className="mt-0.5 h-4 w-4 rounded border border-input"
              />
              <span>
                <code className="text-xs">completedTournaments</code> 1 página (90d)
              </span>
            </label>
          </fieldset>
        </details>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="secondary" onClick={handleCarregar}>
            Carregar diagnóstico (cache + granular)
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={pendingSyncMode !== null}
            onClick={() => runSync("light")}
          >
            {pendingSyncMode === "light"
              ? "A sincronizar KPIs…"
              : "Sincronizar KPIs (só API — 1 grupo)"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pendingSyncMode !== null}
            onClick={() => runSync("full")}
          >
            {pendingSyncMode === "full"
              ? "A sincronizar completo…"
              : "Sincronizar completo (+ torneios 90d)"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground max-w-3xl">
          <strong>Só KPIs</strong> chama <code className="text-xs">runDailySyncSharkScope(true, {"{"} onlyPlayerGroup, syncMode: &quot;light&quot; {"}"})</code>{" "}
          — atualiza lifetime + 10d/30d/90d via API para este <strong>playerGroup</strong> apenas (poucas buscas; compare com o site).
          <strong> Completo</strong> adiciona <code className="text-xs">completedTournaments</code> e breakdown por rede/tipo (mais buscas).
        </p>
      </div>

      {syncResult && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            syncResult.success
              ? "border-green-500/40 bg-green-500/5"
              : "border-destructive/40 bg-destructive/5"
          }`}
        >
          {syncResult.success ? (
            <div className="space-y-2">
              <p className="font-medium text-foreground">
                Sync concluído — {syncResult.playerName}{" "}
                <code className="text-xs">({syncResult.playerGroup})</code>
              </p>
              <ul className="list-inside list-disc text-muted-foreground space-y-1">
                <li>
                  Modo: <strong className="text-foreground">{syncResult.syncMode}</strong> (light = só KPIs
                  via API; full = + torneios)
                </li>
                <li>
                  <strong className="text-foreground font-mono">{syncResult.sharkHttpCalls}</strong>{" "}
                  chamadas HTTP contadas (contador interno do sync — mesmo do cron)
                </li>
                <li>
                  Buscas restantes (API):{" "}
                  <strong className="font-mono">
                    {syncResult.remainingSearches != null ? syncResult.remainingSearches : "—"}
                  </strong>
                </li>
                <li>
                  Jogadores processados neste grupo: <strong>{syncResult.processed}</strong> · erros:{" "}
                  <strong>{syncResult.errors}</strong>
                </li>
                <li>
                  Grupos distintos no banco: <strong>{syncResult.groupCountInDb}</strong> — estimativa se
                  rodasses o mesmo padrão para <em>todos</em> os grupos:{" "}
                  <strong className="font-mono text-foreground">
                    {syncResult.extrapolateCallsIfFullSync}
                  </strong>{" "}
                  chamadas HTTP (linear; volume real varia por grupo)
                </li>
              </ul>
            </div>
          ) : (
            <p className="text-destructive">{syncResult.error}</p>
          )}
        </div>
      )}

      {players.length === 0 && (
        <p className="text-sm text-amber-600">Nenhum jogador ativo com Grupo Shark no banco.</p>
      )}

      {!playerId && players.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Selecione um jogador e use <strong>Carregar</strong> ou <strong>Sincronizar</strong>.
        </p>
      )}

      {children}
    </>
  );
}
