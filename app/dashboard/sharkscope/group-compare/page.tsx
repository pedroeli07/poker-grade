import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils";
import { loadSharkscopeGroupCompare } from "@/lib/data/sharkscope/group-compare";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Debug — Grupo SharkScope",
  description:
    "Compare valores da API com o que a tabela de jogadores usa (cache e extração).",
};

export default async function SharkscopeGroupComparePage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; live?: string; probe?: string }>;
}) {
  const session = await requireSession();
  if (!canWriteOperations(session)) redirect("/dashboard");

  const sp = await searchParams;
  const defaultGroup = "Bruno Sampaio CL 2025";
  const group = (sp.group ?? defaultGroup).trim();
  const live = sp.live === "1" || sp.live === "on" || sp.live === "true";
  const probeNetworks = sp.probe === "1" || sp.probe === "on" || sp.probe === "true";

  const data = await loadSharkscopeGroupCompare(group, { live, probeNetworks });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Debug — Player group vs tabela</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use o mesmo nome do campo <strong>Grupo Shark</strong> (ex.:{" "}
          <code className="text-xs">Bruno Sampaio CL 2025</code>). Por padrão só lê o{" "}
          <strong>cache local</strong>. <strong>Probe por rede</strong> chama{" "}
          <code className="text-xs">completedTournaments</code> + teste se{" "}
          <code className="text-xs">statistics</code> aceita filtro <code className="text-xs">Network:</code> no
          grupo (~2–3 buscas; a API costuma rejeitar Network em Player Group).
        </p>
      </div>

      <form
        action="/dashboard/sharkscope/group-compare"
        method="get"
        className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4"
      >
        <div className="space-y-2">
          <Label htmlFor="group">Nome do grupo (playerGroup)</Label>
          <Input id="group" name="group" defaultValue={group} placeholder={defaultGroup} />
        </div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="live"
            name="live"
            value="1"
            defaultChecked={live}
            className="mt-1 h-4 w-4 rounded border border-input"
          />
          <Label htmlFor="live" className="font-normal leading-snug">
            Buscar API agora (10d) — consome buscas SharkScope
          </Label>
        </div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="probe"
            name="probe"
            value="1"
            defaultChecked={probeNetworks}
            className="mt-1 h-4 w-4 rounded border border-input"
          />
          <Label htmlFor="probe" className="font-normal leading-snug">
            Probe por rede — últimos 100 torneios (30d) + teste TotalROI com{" "}
            <code className="text-xs">Network:PokerStars</code> (esperado: não suportado)
          </Label>
        </div>
        <Button type="submit" variant="default">
          Carregar comparação
        </Button>
      </form>

      {!data.ok ? (
        <p className="text-sm text-destructive">{data.error}</p>
      ) : (
        <>
          <section className="space-y-2">
            <h2 className="text-lg font-medium">Contexto</h2>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              <li>
                Jogador no banco:{" "}
                {data.player ? (
                  <>
                    {data.player.name} <code className="text-xs">({data.player.id})</code>
                  </>
                ) : (
                  <span className="text-amber-600">nenhum registro com esse playerGroup exato</span>
                )}
              </li>
              <li>
                Endpoint API (10d):{" "}
                <code className="break-all text-xs">{data.apiPath10d}</code>
              </li>
              <li>
                Cache stats_10d:{" "}
                {data.cache10d
                  ? `válido até ${data.cache10d.expiresAt.toISOString()}`
                  : "ausente"}
              </li>
              <li>
                Cache stats_30d:{" "}
                {data.cache30d
                  ? `válido até ${data.cache30d.expiresAt.toISOString()}`
                  : "ausente"}
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Hipóteses de divergência (o que esta página testa)</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">H1 — ROI:</strong> a tabela de jogadores usa só{" "}
                <code>TotalROI</code> (ROI total). Se vier vazio, a célula fica &quot;—&quot; — não
                substituímos por <code>AvROI</code> para não parecer ROI total.
              </li>
              <li>
                <strong className="text-foreground">H2 — FP/FT:</strong> só{" "}
                <code>stats_10d</code> (EarlyFinish / LateFinish). Sem valor no JSON → célula
                &quot;—&quot;.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">Valores no cache (10d) — como na API</h2>
            {data.statsFromCache10d ? (
              <CompareTable
                rows={[
                  ["TotalROI (ROI total agregado)", data.statsFromCache10d.TotalROI],
                  ["AvROI (ROI médio)", data.statsFromCache10d.AvROI],
                  ["EarlyFinish (FP)", data.statsFromCache10d.EarlyFinish],
                  ["LateFinish (FT)", data.statsFromCache10d.LateFinish],
                ]}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Sem cache 10d para este grupo.</p>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">Referência — cache 30d (não usado na tabela)</h2>
            {data.statsFromCache30d ? (
              <CompareTable
                rows={[
                  ["EarlyFinish", data.statsFromCache30d.EarlyFinish],
                  ["LateFinish", data.statsFromCache30d.LateFinish],
                ]}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Sem cache 30d.</p>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">O que a tabela de jogadores mostra hoje</h2>
            <p className="text-sm text-muted-foreground">
              Igual à tabela de jogadores: ROI = <code>TotalROI</code> do 10d; FP/FT = EarlyFinish /
              LateFinish do mesmo cache 10d.
            </p>
            <CompareTable
              rows={[
                ["ROI total (10d) — TotalROI", data.appTableAsImplemented.roiTenDay],
                ["FP (10d) — EarlyFinish", data.appTableAsImplemented.fpTenDay],
                ["FT (10d) — LateFinish", data.appTableAsImplemented.ftTenDay],
              ]}
            />
          </section>

          {data.networkProbe && (
            <section className="space-y-2">
              <h2 className="text-lg font-medium">Por rede — torneios (completedTournaments)</h2>
              <p className="text-sm text-muted-foreground">
                Mesma ideia da coluna <strong>Rede</strong> no CSV: contamos quantos torneios aparecem
                por rede na resposta (amostra até 100, últimos 30d). Custo típico: ~1 busca SharkScope
                por lote de até 100 torneios.
              </p>
              <p className="text-xs text-muted-foreground break-all">
                <code>{data.networkProbe.path}</code>
              </p>
              {!data.networkProbe.ok ? (
                <p className="text-sm text-destructive">{data.networkProbe.error}</p>
              ) : Object.keys(data.networkProbe.histogram).length === 0 ? (
                <p className="text-sm text-amber-600">
                  Nenhuma rede extraída do JSON — o parser pode precisar ajuste ao formato real da API.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Torneios contados: <strong>{data.networkProbe.totalTournamentsCounted}</strong>
                  </p>
                  <div className="overflow-x-auto rounded-md border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50 text-left">
                          <th className="px-3 py-2 font-medium">Rede (API)</th>
                          <th className="px-3 py-2 font-mono">Torneios na amostra</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(data.networkProbe.histogram).map(([net, n]) => (
                          <tr key={net} className="border-b border-border/60 last:border-0">
                            <td className="px-3 py-2">{net}</td>
                            <td className="px-3 py-2 font-mono tabular-nums">{n}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          )}

          {data.networkFilterStatTest && (
            <section className="space-y-2">
              <h2 className="text-lg font-medium">Teste — statistics com filtro Network</h2>
              <p className="text-sm text-muted-foreground">{data.networkFilterStatTest.note}</p>
              <ul className="list-inside list-disc space-y-1 break-all text-xs text-muted-foreground">
                <li>
                  Baseline: <code>{data.networkFilterStatTest.baselinePath}</code> → TotalROI:{" "}
                  {data.networkFilterStatTest.baselineTotalRoi === null
                    ? "—"
                    : `${data.networkFilterStatTest.baselineTotalRoi.toFixed(2)}%`}
                </li>
                <li>
                  Com filtro: <code>{data.networkFilterStatTest.filteredPath}</code> → TotalROI:{" "}
                  {data.networkFilterStatTest.filteredTotalRoi === null
                    ? "—"
                    : `${data.networkFilterStatTest.filteredTotalRoi.toFixed(2)}%`}
                </li>
              </ul>
            </section>
          )}

          <section className="space-y-2">
            <h2 className="text-lg font-medium">Busca ao vivo na API (10d)</h2>
            {data.liveError ? (
              <p className="text-sm text-destructive">{data.liveError}</p>
            ) : data.live ? (
              <>
                <CompareTable
                  rows={[
                    ["TotalROI", data.live.totalRoi],
                    ["AvROI", data.live.avRoi],
                    ["EarlyFinish", data.live.earlyFinish],
                    ["LateFinish", data.live.lateFinish],
                  ]}
                />
                <details className="rounded border border-border bg-muted/30 p-3 text-sm">
                  <summary className="cursor-pointer font-medium">
                    Todas as estatísticas canônicas (mapa)
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto text-xs">
                    {JSON.stringify(data.live.allStatsFromMap, null, 2)}
                  </pre>
                </details>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Marque &quot;Buscar API agora&quot; e envie o formulário para preencher esta seção
                (gasta buscas).
              </p>
            )}
          </section>

          <p className="text-xs text-muted-foreground">
            Documentação local: <code className="text-xs">SharkScope_WS_API_PT.md</code> na raiz do
            repositório. No site, a coluna &quot;ROI tot.&quot; corresponde a{" "}
            <code>TotalROI</code> na API; &quot;ROI Méd&quot; tende a alinhar com{" "}
            <code>AvROI</code>.
          </p>
        </>
      )}
    </div>
  );
}

function CompareTable({ rows }: { rows: [string, number | null][] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left">
            <th className="px-3 py-2 font-medium">Métrica</th>
            <th className="px-3 py-2 font-mono tabular-nums">Valor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, v]) => (
            <tr key={label} className="border-b border-border/60 last:border-0">
              <td className="px-3 py-2 text-muted-foreground">{label}</td>
              <td className="px-3 py-2 font-mono">
                {v === null ? "—" : `${v.toFixed(1)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
