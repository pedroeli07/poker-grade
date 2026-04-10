"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import {
  AnalyticsProfitCell,
  AnalyticsRoiBadge,
} from "@/components/sharkscope/analytics-cells";
import { AnalyticsRoiBarChart } from "@/components/sharkscope/analytics-roi-bar-chart";
import {
  cardClassName,
  SHARKSCOPE_ANALYTICS_PERIODS,
  SHARKSCOPE_ANALYTICS_TAB_LABELS,
  TAB_ICONS,
  TAB_IDS,
} from "@/lib/constants";
import type { AnalyticsClientProps, TypeStat } from "@/lib/types";
import { useAnalyticsPageClient } from "@/hooks/sharkscope/analytics/use-analytics-page-client";
import { SyncSharkScopeButton } from "@/components/sharkscope/sync-button";

const TYPE_LABEL_PT: Record<TypeStat["type"], string> = {
  Bounty: "Bounty / PKO",
  Vanilla: "Vanilla / Regular",
  Satellite: "Satélite",
};

export function AnalyticsClient(props: AnalyticsClientProps) {
  const {
    period,
    setPeriod,
    activeTab,
    setActiveTab,
    stats,
    hasData,
    ranking,
    tierStats,
    typeStats30d,
  } = useAnalyticsPageClient(props);

  const hasTypeData = typeStats30d.some(
    (s) =>
      s.roi !== null ||
      s.roiWeighted !== null ||
      s.profit !== null ||
      (s.count !== null && s.count > 0)
  );

  const siteBarRows = stats.map((s) => ({
    key: s.network,
    shortLabel: s.label.length > 16 ? `${s.label.slice(0, 14)}…` : s.label,
    fullLabel: s.label,
    roi: s.roiWeighted,
  }));

  const tierBarRows = tierStats.map((s) => ({
    key: s.tier,
    shortLabel: s.tier,
    fullLabel: `Tier ${s.tier} (Low / Mid / High)`,
    roi: s.roiWeighted,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Analytics SharkScope
          </h2>
          <p className="text-muted-foreground mt-1">
            Análise de performance do time por rede e período. Dados do cache.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <SyncSharkScopeButton />
          <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1 bg-muted/30 w-fit">
            {SHARKSCOPE_ANALYTICS_PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`cursor-pointer px-3 py-1.5 text-sm rounded-md font-medium transition-all ${period === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border/60">
        {TAB_IDS.map((id) => {
          const Icon = TAB_ICONS[id];
          const label =
            id === "ranking"
              ? `${SHARKSCOPE_ANALYTICS_TAB_LABELS[id]} (${period})`
              : SHARKSCOPE_ANALYTICS_TAB_LABELS[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === "site" && (
        <div>
          {!hasData ? (
            <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-blue-500/10 px-4">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-foreground">
                Sem estatísticas por rede no cache
              </p>
              <p className="text-xs mt-2 max-w-xl mx-auto leading-relaxed">
                Cadastre <strong>nicks SharkScope por rede</strong> (GGPoker, PokerStars, etc.) em cada
                jogador e rode <strong>Sincronizar SharkScope</strong>. O <em>player group</em> alimenta
                Ranking e Por TIER; esta aba consolida só redes reais (um barra por site).
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border border-border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-500/10 hover:bg-transparent">
                      <TableHead>Rede</TableHead>
                      <TableHead>ROI Médio</TableHead>
                      <TableHead>ROI Total</TableHead>
                      <TableHead>Lucro Total</TableHead>
                      <TableHead>Volume (torneios)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.map((s) => (
                      <TableRow key={s.network} className="hover:bg-sidebar-accent/50">
                        <TableCell className="font-medium">{s.label}</TableCell>
                        <TableCell>
                          <AnalyticsRoiBadge roi={s.roi} />
                        </TableCell>
                        <TableCell>
                          <AnalyticsRoiBadge roi={s.roiWeighted} />
                        </TableCell>
                        <TableCell>
                          <AnalyticsProfitCell profit={s.profit} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.count !== null ? s.count.toFixed(0) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <AnalyticsRoiBarChart
                title="ROI total do time por rede (Σ ROI×torneios / Σ torneios) — eixo Y em %"
                rows={siteBarRows}
              />
            </>
          )}
        </div>
      )}

      {activeTab === "ranking" && (
        <div>
          {ranking.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-blue-500/10">
              <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                Sem dados de cache para este período ({period}). Sincronize o SharkScope.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-500/20 hover:bg-blue-500/20">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Jogador</TableHead>
                    <TableHead>ROI {period}</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((entry, i) => (
                    <TableRow key={entry.player.id} className="hover:bg-sidebar-accent/50 bg-white">
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {i + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{entry.player.name}</div>
                        {entry.player.nickname && (
                          <div className="text-xs text-muted-foreground">
                            @{entry.player.nickname}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <AnalyticsRoiBadge roi={entry.roi} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.count > 0 ? entry.count.toFixed(0) : "—"}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/players/${entry.player.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Ver perfil →
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {activeTab === "tier" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Consolidado por Tier (ABI médio SharkScope): Low (&lt;$15), Mid ($15–$50), High
            (&gt;$50). Período: <span className="font-medium text-foreground">{period}</span>.
          </p>
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-500/20 hover:bg-blue-500/20">
                  <TableHead>Tier</TableHead>
                  <TableHead>ROI Médio</TableHead>
                  <TableHead>ROI Total</TableHead>
                  <TableHead>Lucro Acumulado</TableHead>
                  <TableHead>Volume (torneios)</TableHead>
                  <TableHead>Jogadores no Tier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tierStats.map((s) => (
                  <TableRow key={s.tier} className="hover:bg-sidebar-accent/50 bg-white">
                    <TableCell className="font-semibold">{s.tier}</TableCell>
                    <TableCell>
                      <AnalyticsRoiBadge roi={s.roi} />
                    </TableCell>
                    <TableCell>
                      <AnalyticsRoiBadge roi={s.roiWeighted} />
                    </TableCell>
                    <TableCell>
                      <AnalyticsProfitCell profit={s.profit} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.count !== null ? s.count.toFixed(0) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.players}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AnalyticsRoiBarChart
            title="ROI total do time por tier (mesma fórmula ponderada)"
            rows={tierBarRows}
          />
        </div>
      )}

      {activeTab === "bounty" && (
        <div className="space-y-4">
          {period === "90d" && (
            <p className="text-xs text-muted-foreground rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              Breakdown Bounty / Vanilla / Satélite usa filtros SharkScope na janela de{" "}
              <strong>30 dias</strong> (buscas extras na sincronização). O seletor{" "}
              <strong>90d</strong> acima afeta Por Site, Ranking e Por TIER.
            </p>
          )}
          {!hasTypeData ? (
            <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-amber-500/10">
              <Zap className="h-10 w-10 mx-auto mb-3 opacity-30 text-amber-500" />
              <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-500 mb-1">
                Sem dados por tipo de torneio
              </h3>
              <p className="text-xs max-w-lg mx-auto">
                Rode <strong>Sincronizar SharkScope</strong> para buscar estatísticas com filtros
                Type:B (Bounty), Type:SAT (Satélite) e excluindo ambos (Vanilla), além do resumo
                geral.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-500/15 hover:bg-amber-500/15">
                    <TableHead>Tipo</TableHead>
                    <TableHead>ROI Médio</TableHead>
                    <TableHead>ROI Total</TableHead>
                    <TableHead>Lucro Total</TableHead>
                    <TableHead>Volume (torneios)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typeStats30d.map((s) => (
                    <TableRow key={s.type} className="hover:bg-sidebar-accent/50 bg-white">
                      <TableCell className="font-medium">{TYPE_LABEL_PT[s.type]}</TableCell>
                      <TableCell>
                        <AnalyticsRoiBadge roi={s.roi} />
                      </TableCell>
                      <TableCell>
                        <AnalyticsRoiBadge roi={s.roiWeighted} />
                      </TableCell>
                      <TableCell>
                        <AnalyticsProfitCell profit={s.profit} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.count !== null ? s.count.toFixed(0) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {hasTypeData && (
            <AnalyticsRoiBarChart
              title="ROI total por tipo de torneio (30d, filtros SharkScope Type:B / SAT / restante)"
              rows={typeStats30d.map((s) => ({
                key: s.type,
                shortLabel: TYPE_LABEL_PT[s.type],
                fullLabel: TYPE_LABEL_PT[s.type],
                roi: s.roiWeighted,
              }))}
            />
          )}
        </div>
      )}

      <Card className={`border-border/40 ${cardClassName}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sobre os dados
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• Todos os dados são lidos do cache local — sem chamadas à API SharkScope.</p>
          <p>• O cache é atualizado automaticamente pelo cron job às 06h00 BRT.</p>
          <p>
            • ROI médio: média simples dos AvROI; ROI total: Σ(ROI×torneios)/Σ(torneios) (mesmo jogador
            em vários nicks na mesma rede entra uma vez por nick).
          </p>
          <p>
            • Lucro total soma TotalProfit do SharkScope por entrada de cache (varredura completa do JSON
            para achar Profit/TotalProfit).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
