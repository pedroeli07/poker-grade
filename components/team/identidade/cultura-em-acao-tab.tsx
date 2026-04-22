"use client";

import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, RefreshCw, TrendingUp } from "lucide-react";
import type { CulturaEmAcaoData } from "@/lib/data/team/cultura-em-acao";
import { cn } from "@/lib/utils/cn";
import PlayerTourneyStatCard from "@/components/meus-torneios/player-tourney-stat-card";

const SectionHeader = (icon: React.ReactNode, title: string) => (
  <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
    {icon}
    <h4 className="text-sm font-semibold text-foreground">{title}</h4>
  </div>
);

const detailCardClass =
  "overflow-hidden rounded-xl border border-border/60 bg-card/80 ring-1 ring-border/30 shadow-sm transition-shadow hover:shadow-md";

const CulturaEmAcaoTab = memo(function CulturaEmAcaoTab({ data }: { data: CulturaEmAcaoData }) {
  const router = useRouter();
  const {
    weekLabel,
    adesaoRituaisPct,
    adesaoRituaisHasData,
    quebrasCount,
    quebras,
    exemplarCount,
    exemplares,
    riscoCount,
    riscos,
  } = data;

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold tracking-tight">Cultura em ação</h3>
            <span className="rounded-md border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {weekLabel}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Dashboard da semana corrente: adesão a rituais (participações registadas) e alertas do SharkScope; metas
            refletem o estado atual do jogador.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-2"
            onClick={() => router.refresh()}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </Button>
          <Button type="button" size="sm" className="h-8 gap-2" asChild>
            <Link href="/admin/dashboard">
              Ver no WBR <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <PlayerTourneyStatCard
          label="Adesão rituais"
          value={adesaoRituaisHasData && adesaoRituaisPct != null ? `${adesaoRituaisPct}%` : "—"}
          sub={adesaoRituaisHasData ? "Participações na semana" : "Sem presenças na semana"}
          tone="blue"
          progressValue={adesaoRituaisHasData && adesaoRituaisPct != null ? adesaoRituaisPct : null}
        />
        <PlayerTourneyStatCard
          label="Alertas (semana)"
          value={quebrasCount}
          sub={quebrasCount > 0 ? "Não reconhecidos" : "Nenhum na semana"}
          tone="red"
        />
        <PlayerTourneyStatCard
          label="Execução exemplar"
          value={exemplarCount}
          sub={exemplarCount > 0 ? "Metas ativas no verde" : "Nenhum perfil em destaque"}
          tone="emerald"
        />
        <PlayerTourneyStatCard
          label="Em risco (metas)"
          value={riscoCount}
          sub={riscoCount > 0 ? "Com meta fora do trilho" : "Ninguém fora do trilho"}
          tone="amber"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        <TrendingUp className="inline h-3.5 w-3.5 align-text-bottom text-blue-500" /> A coluna de alertas lista
        disparações de métricas do SharkScope; «Execução exemplar» e «Em risco» usam o estado das metas ativas.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className={detailCardClass}>
          {SectionHeader(<AlertTriangle className="h-4 w-4 text-red-500" />, "Quebras da semana")}
          <CardContent className="p-0">
            {quebras.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nenhum alerta não reconhecido nesta semana.</p>
            ) : (
              <div className="divide-y">
                {quebras.map((q, i) => (
                  <div key={`${q.playerName}-${q.tipo}-${i}`} className="p-4">
                    <div className="mb-0.5 text-sm font-semibold text-foreground">{q.playerName}</div>
                    <div className="mb-1.5 text-xs text-muted-foreground">{q.tipo}</div>
                    <div className="inline-block rounded bg-red-50 px-2 py-1 text-xs text-red-600 dark:bg-red-950/50">
                      {q.detalhe}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={detailCardClass}>
          {SectionHeader(<CheckCircle2 className="h-4 w-4 text-emerald-500" />, "Execução exemplar")}
          <CardContent className="p-0">
            {exemplares.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                Ninguém com todas as metas ativas em «no trilho» (ou metas ainda não configuradas).
              </p>
            ) : (
              <div className="divide-y">
                {exemplares.map((row) => (
                  <div key={row.nome} className="p-4">
                    <div className="mb-1 text-sm font-semibold text-foreground">{row.nome}</div>
                    <div className="mb-2 text-xs text-muted-foreground">{row.sub}</div>
                    <div className="flex flex-wrap gap-2">
                      {row.tags.map((t, i) => (
                        <span
                          key={`${t.label}-${i}`}
                          className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", t.className)}
                        >
                          {t.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={detailCardClass}>
          {SectionHeader(<Activity className="h-4 w-4 text-amber-500" />, "Em risco cultural")}
          <CardContent className="p-0">
            {riscos.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nenhum jogador com metas fora do trilho.</p>
            ) : (
              <div className="divide-y">
                {riscos.map((row) => (
                  <div key={row.nome} className="relative p-4">
                    <div className="absolute right-4 top-4 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                      {row.badge}
                    </div>
                    <div className="mb-2 pr-20 text-sm font-semibold text-foreground">{row.nome}</div>
                    <ul className="space-y-1">
                      {row.issues.map((issue) => (
                        <li key={issue} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

CulturaEmAcaoTab.displayName = "CulturaEmAcaoTab";

export default CulturaEmAcaoTab;
