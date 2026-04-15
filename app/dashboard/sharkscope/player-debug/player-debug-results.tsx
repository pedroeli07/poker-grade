import type { SharkscopePlayerDebugResult } from "@/lib/data/sharkscope-player-debug";

/** Uma casa decimal, alinhado à tabela de jogadores (`player-table-display` / FP/FT cells). */
function fmtPct(v: number | null) {
  if (v === null) return "—";
  return `${v.toFixed(1)}%`;
}

function fmtTs(sec: number | null) {
  if (sec === null || !Number.isFinite(sec)) return "—";
  return new Date(sec * 1000).toISOString().slice(0, 10);
}

export function PlayerDebugResults({
  data,
}: {
  data: Extract<SharkscopePlayerDebugResult, { ok: true }>;
}) {
  return (
    <>
      <section className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Chamadas granulares (opcional — esta carga)
        </h2>
        <p className="text-2xl font-mono tabular-nums">
          Restantes (API):{" "}
          <strong>{data.remainingSearches != null ? data.remainingSearches : "—"}</strong>
        </p>
        <p className="text-sm">
          GETs neste pedido: <strong className="font-mono">{data.searchCallsThisRequest}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Grupos Shark no banco: <strong>{data.groupCountInDb}</strong> — se repetisses as mesmas
          chamadas para cada grupo:{" "}
          <strong className="font-mono text-foreground">{data.extrapolateGranularForAllGroups}</strong>
        </p>
        <p className="text-xs text-muted-foreground">{data.note}</p>
        {data.searchLines.length > 0 && (
          <ul className="list-inside list-disc text-xs text-muted-foreground space-y-1">
            {data.searchLines.map((l, i) => (
              <li key={i}>
                <span className="font-medium text-foreground">{l.label}</span> —{" "}
                <code className="break-all">{l.path}</code>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Jogador</h2>
        <p className="text-sm">
          {data.player.name}{" "}
          <code className="text-xs text-muted-foreground">({data.player.id})</code>
        </p>
        <p className="text-sm">
          Grupo Shark: <code className="text-xs">{data.player.playerGroup}</code>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Cache local (sem custo de API agora)</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            stats_10d:{" "}
            {data.cache.stats10d.hasData ? `válido até ${data.cache.stats10d.expiresAt}` : "vazio"}
          </li>
          <li>
            stats_30d:{" "}
            {data.cache.stats30d.hasData ? `válido até ${data.cache.stats30d.expiresAt}` : "vazio"}
          </li>
          <li>
            stats_90d:{" "}
            {data.cache.stats90d.hasData ? `válido até ${data.cache.stats90d.expiresAt}` : "vazio"}
          </li>
          <li>
            stats_lifetime:{" "}
            {data.cache.statsLifetime.hasData
              ? `válido até ${data.cache.statsLifetime.expiresAt}`
              : "vazio"}
          </li>
          <li>
            group_site_breakdown 90d:{" "}
            {data.cache.breakdown90d.hasPayload
              ? `${data.cache.breakdown90d.tournamentRows ?? "?"} torneios na amostra; datas ${fmtTs(data.cache.breakdown90d.oldestDateSec)} → ${fmtTs(data.cache.breakdown90d.newestDateSec)}`
              : "vazio"}
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Como na tabela de jogadores (cache 10d)</h2>
        <p className="text-xs text-muted-foreground mb-2">
          Compare com a pesquisa manual no site (mesmo grupo PlayerGroup e janela ~10d).
        </p>
        <table className="w-full text-sm border border-border rounded-md overflow-hidden">
          <tbody>
            <tr className="border-b border-border bg-muted/40">
              <td className="px-3 py-2">ROI total (10d)</td>
              <td className="px-3 py-2 font-mono">{fmtPct(data.tableAsApp.roiTenDay)}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-3 py-2">FP (10d)</td>
              <td className="px-3 py-2 font-mono">{fmtPct(data.tableAsApp.fpTenDay)}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">FT (10d)</td>
              <td className="px-3 py-2 font-mono">{fmtPct(data.tableAsApp.ftTenDay)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {data.statsFromCache.ten && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Valores brutos no cache 10d</h2>
          <table className="w-full text-sm border border-border rounded-md overflow-hidden">
            <tbody>
              {(
                [
                  ["TotalROI", data.statsFromCache.ten.TotalROI],
                  ["AvROI", data.statsFromCache.ten.AvROI],
                  ["EarlyFinish", data.statsFromCache.ten.EarlyFinish],
                  ["LateFinish", data.statsFromCache.ten.LateFinish],
                ] as const
              ).map(([k, v]) => (
                <tr key={k} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-muted-foreground">{k}</td>
                  <td className="px-3 py-2 font-mono">{fmtPct(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {(data.api.live10d || data.api.live365d || data.api.liveLifetime || data.api.ctOnePage) && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Respostas ao vivo (chamadas granulares)</h2>
          {data.api.live10d && (
            <div>
              <h3 className="text-sm font-medium mb-1">Statistics 10d</h3>
              <table className="w-full text-sm border border-border rounded-md">
                <tbody>
                  <tr>
                    <td className="px-3 py-2">TotalROI</td>
                    <td className="px-3 py-2 font-mono">{fmtPct(data.api.live10d.TotalROI)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">AvROI</td>
                    <td className="px-3 py-2 font-mono">{fmtPct(data.api.live10d.AvROI)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">EarlyFinish</td>
                    <td className="px-3 py-2 font-mono">{fmtPct(data.api.live10d.EarlyFinish)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">LateFinish</td>
                    <td className="px-3 py-2 font-mono">{fmtPct(data.api.live10d.LateFinish)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {data.api.live365d && (
            <div>
              <h3 className="text-sm font-medium mb-1">Statistics ~365d</h3>
              <table className="w-full text-sm border border-border rounded-md">
                <tbody>
                  <tr>
                    <td className="px-3 py-2">TotalROI</td>
                    <td className="px-3 py-2 font-mono">{fmtPct(data.api.live365d.TotalROI)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">AvROI</td>
                    <td className="px-3 py-2 font-mono">{fmtPct(data.api.live365d.AvROI)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">EarlyFinish</td>
                    <td className="px-3 py-2 font-mono">{fmtPct(data.api.live365d.EarlyFinish)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">LateFinish</td>
                    <td className="px-3 py-2 font-mono">{fmtPct(data.api.live365d.LateFinish)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {data.api.liveLifetime && (
            <div>
              <h3 className="text-sm font-medium mb-1">Statistics lifetime</h3>
              <table className="w-full text-sm border border-border rounded-md">
                <tbody>
                  <tr>
                    <td className="px-3 py-2">TotalROI</td>
                    <td className="px-3 py-2 font-mono">{fmtPct(data.api.liveLifetime.TotalROI)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">AvROI</td>
                    <td className="px-3 py-2 font-mono">{fmtPct(data.api.liveLifetime.AvROI)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">EarlyFinish</td>
                    <td className="px-3 py-2 font-mono">{fmtPct(data.api.liveLifetime.EarlyFinish)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">LateFinish</td>
                    <td className="px-3 py-2 font-mono">{fmtPct(data.api.liveLifetime.LateFinish)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {data.api.ctOnePage && (
            <div>
              <h3 className="text-sm font-medium mb-1">Completed tournaments (1 página)</h3>
              <p className="text-xs break-all text-muted-foreground mb-2">{data.api.ctOnePage.path}</p>
              {!data.api.ctOnePage.ok ? (
                <p className="text-sm text-destructive">{data.api.ctOnePage.error}</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Torneios na amostra: {data.api.ctOnePage.totalTournamentsCounted}
                  </p>
                  <div className="overflow-x-auto rounded-md border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-3 py-2 text-left">Rede</th>
                          <th className="px-3 py-2 text-left">N</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(data.api.ctOnePage.histogram).map(([net, n]) => (
                          <tr key={net} className="border-b border-border/60">
                            <td className="px-3 py-2">{net}</td>
                            <td className="px-3 py-2 font-mono">{n}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      )}
    </>
  );
}
