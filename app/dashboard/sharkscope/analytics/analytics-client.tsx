"use client";

import { useMemo, useState } from "react";
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
import type { NetworkStat, RankingEntry, SharkscopeAnalyticsPeriod, SharkscopeAnalyticsTab, TierStat, TypeStat } from "@/lib/types";
import {
  SHARKSCOPE_ANALYTICS_PERIODS,
  SHARKSCOPE_ANALYTICS_TAB_LABELS,
} from "@/lib/sharkscope/ui-constants";
import { pickSharkscopeStatsByPeriod } from "@/lib/sharkscope/ui-helpers";
import {
  AnalyticsProfitCell,
  AnalyticsRoiBadge,
} from "@/components/sharkscope/analytics-cells";
import { cardClassName, TAB_ICONS, TAB_IDS } from "@/lib/constants";


export function AnalyticsClient({
  stats30d,
  stats90d,
  ranking,
  tierStats30d,
  typeStats30d,
  hasData30d,
  hasData90d,
}: {
  stats30d: NetworkStat[];
  stats90d: NetworkStat[];
  ranking: RankingEntry[];
  tierStats30d: TierStat[];
  typeStats30d: TypeStat[];
  hasData30d: boolean;
  hasData90d: boolean;
}) {
  const [period, setPeriod] = useState<SharkscopeAnalyticsPeriod>("30d");
  const [activeTab, setActiveTab] = useState<SharkscopeAnalyticsTab>("site");

  const stats = useMemo(
    () => pickSharkscopeStatsByPeriod(period, stats30d, stats90d),
    [period, stats30d, stats90d]
  );

  const hasData = period === "30d" ? hasData30d : hasData90d;

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

        <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1 bg-muted/30 w-fit">
          {SHARKSCOPE_ANALYTICS_PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`cursor-pointer px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
                period === p
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 border-b border-border/60">
        {TAB_IDS.map((id) => {
          const Icon = TAB_ICONS[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {SHARKSCOPE_ANALYTICS_TAB_LABELS[id]}
            </button>
          );
        })}
      </div>

      {activeTab === "site" && (
        <div>
          {!hasData ? (
            <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-blue-500/10">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                Sem dados de cache. Execute o cron job ou busque dados de um nick.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-500/10 hover:bg-transparent">
                    <TableHead>Rede</TableHead>
                    <TableHead>ROI Médio</TableHead>
                    <TableHead>Lucro Total</TableHead>
                    <TableHead>Volume (torneis)</TableHead>
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
        </div>
      )}

      {activeTab === "ranking" && (
        <div>
          {ranking.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-blue-500/10">
              <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Sem dados de cache disponíveis para ranking.</p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-500/10 hover:bg-transparent">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Jogador</TableHead>
                    <TableHead>ROI 30d</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((entry, i) => (
                    <TableRow key={entry.player.id} className="hover:bg-sidebar-accent/50">
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
            Resultados consolidados por Tier (estimado pelo ABI SharkScope): Low (&lt;$15), Mid ($15-$50), High (&gt;$50). Histórico de 30 dias.
          </p>
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-500/10 hover:bg-transparent">
                  <TableHead>Tier</TableHead>
                  <TableHead>ROI Médio</TableHead>
                  <TableHead>Lucro Acumulado</TableHead>
                  <TableHead>Volume (torneios)</TableHead>
                  <TableHead>Jogadores no Tier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tierStats30d.map((s) => (
                  <TableRow key={s.tier} className="hover:bg-sidebar-accent/50">
                    <TableCell className="font-semibold">{s.tier}</TableCell>
                    <TableCell>
                      <AnalyticsRoiBadge roi={s.roi} />
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
        </div>
      )}

      {activeTab === "bounty" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-amber-500/10">
            <Zap className="h-10 w-10 mx-auto mb-3 opacity-30 text-amber-500" />
            <h3 className="text-sm font-semibold text-amber-600 mb-1">
              Separação Bounty x Regular Requer Sincronização Expandida
            </h3>
            <p className="text-xs max-w-md mx-auto">
              A API do SharkScope não detalha proporção PKO/Vanilla via resumos globais (Profile Stats) sem custar "Searches" extras para cada tipo.
              Atualmente, para economizar cota, esta aba serve como visualização dos dados importados do Lobbyze ou via Scout manual.
            </p>
          </div>
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
          <p>• ROI e lucro são médias/somas de todos os nicks cadastrados por rede.</p>
        </CardContent>
      </Card>
    </div>
  );
}
