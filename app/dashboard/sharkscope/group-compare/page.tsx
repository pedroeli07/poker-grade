import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils";
import { loadSharkscopeGroupCompare } from "@/lib/data/sharkscope-group-compare";
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
  searchParams: Promise<{ group?: string; live?: string }>;
}) {
  const session = await requireSession();
  if (!canWriteOperations(session)) redirect("/dashboard");

  const sp = await searchParams;
  const defaultGroup = "adriano silva cl 2025";
  const group = (sp.group ?? defaultGroup).trim();
  const live = sp.live === "1" || sp.live === "on" || sp.live === "true";

  const data = await loadSharkscopeGroupCompare(group, { live });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Debug — Player group vs tabela</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use o mesmo nome do campo <strong>Grupo Shark</strong> do jogador (ex.: Adriano →{" "}
          <code className="text-xs">adriano silva cl 2025</code>). Por padrão só lê o{" "}
          <strong>cache local</strong>; marque a opção abaixo para uma busca nova na API (consome
          buscas SharkScope).
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
