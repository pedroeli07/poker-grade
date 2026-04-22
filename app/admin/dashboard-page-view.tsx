import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  AlertTriangle,
  ShieldCheck,
  Target,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Grid3X3,
  Info,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { DeleteImportButton } from "@/components/imports/delete-import-button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
import { cn } from "@/lib/utils/cn";
import type { DashboardPageData } from "@/hooks/dashboard/dashboard-page-load";
import { ACTION_STYLE } from "@/lib/constants/sharkscope/type-filters";


export function DashboardPageView(data: DashboardPageData) {
  const {
    activePlayers,
    pendingReviews,
    recentImports,
    onTrack,
    offTrack,
    adherencePct,
    totalPlayed,
    inGrade,
    alertCounts,
    recentLimitChanges,
    showDeleteImport,
  } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Overview</h2>
        <p className="text-muted-foreground mt-1">
          Visão geral do time de jogadores.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-muted-foreground tracking-wide">Jogadores Ativos</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{activePlayers}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              <Link href="/admin/jogadores" className="hover:text-primary transition-colors">
                Ver todos →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold text-muted-foreground tracking-wide">Aderência de Grade</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="p-2 max-w-[200px]">
                  Cálculo: (Programados / Jogados Totais). Não considera torneios não jogados.
                </TooltipContent>
              </Tooltip>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {adherencePct != null ? `${adherencePct}%` : "—"}
            </div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              {totalPlayed > 0
                ? `${inGrade} de ${totalPlayed} jogados foram na grade`
                : "Nenhuma importação ainda"}
            </p>
            {(alertCounts.red > 0 || alertCounts.yellow > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs border-t border-border/40 pt-2">
                {alertCounts.red > 0 && (
                  <span className="flex items-center gap-1 text-red-500 font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    {alertCounts.red} alerta{alertCounts.red !== 1 ? "s" : ""} vermelho{alertCounts.red !== 1 ? "s" : ""}
                  </span>
                )}
                {alertCounts.yellow > 0 && (
                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    {alertCounts.yellow} amarelo{alertCounts.yellow !== 1 ? "s" : ""}
                  </span>
                )}
                <Link href="/admin/sharkscope/alertas" className="text-primary hover:underline ml-auto">
                  Ver alertas →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cn(cardClassName, pendingReviews > 0 && "hover:glow-primary")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-muted-foreground tracking-wide">Revisões Pendentes</CardTitle>
            <AlertTriangle className={cn("h-5 w-5", pendingReviews > 0 ? "text-red-500" : "text-muted-foreground")} />
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${pendingReviews > 0 ? "text-primary" : "text-primary"}`}>
              {pendingReviews}
            </div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              {pendingReviews > 0 ? (
                <Link href="/admin/grades/revisao" className="hover:text-primary transition-colors">
                  Revisar agora →
                </Link>
              ) : (
                "Tudo em dia"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-muted-foreground tracking-wide">Targets On Track</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{onTrack}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              {offTrack > 0 ? (
                <span className="text-primary">{offTrack} fora da meta</span>
              ) : (
                "Todos na meta"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className={cn("col-span-4", cardClassName)}>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Importações Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-[15px]">
              <Link href="/admin/grades/importacoes">
                Ver todas <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentImports.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-[15px] border border-dashed border-border/50 rounded-lg gap-3">
                <Grid3X3 className="h-10 w-10 opacity-40" />
                Nenhuma importação realizada ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {recentImports.map((imp) => {
                  const playedCount = imp.matchedInGrade + imp.outOfGrade;
                  const pct =
                    playedCount > 0
                      ? Math.round((imp.matchedInGrade / playedCount) * 100)
                      : 0;
                  return (
                    <div key={imp.id} className="flex items-center gap-4 group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-semibold truncate text-foreground">{imp.fileName}</p>
                          {imp.playerName && (
                            <span className="text-[13px] font-medium text-muted-foreground shrink-0">
                              · {imp.playerName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground/40 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="text-[11px] p-2">
                                Fora da grade: {imp.outOfGrade} <br />
                                Dentro da grade: {imp.matchedInGrade}
                              </TooltipContent>
                            </Tooltip>
                            <span className="text-[13px] font-bold text-muted-foreground">{pct}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-semibold text-foreground">{imp.totalRows} torneios</p>
                        <p className="text-[12px] font-medium text-muted-foreground mt-0.5">
                          {format(imp.createdAt, "dd/MM", { locale: ptBR })}
                        </p>
                      </div>
                      {showDeleteImport && (
                        <div className="shrink-0 ml-1">
                          <DeleteImportButton importId={imp.id} iconOnly />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cn("col-span-3", cardClassName)}>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Movimentações de Limite</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-[15px]">
              <Link href="/admin/grades/historico">
                Ver histórico <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentLimitChanges.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-[15px] border border-dashed border-border/50 rounded-lg gap-3">
                <TrendingUp className="h-10 w-10 opacity-40" />
                Nenhuma movimentação recente.
              </div>
            ) : (
              <div className="space-y-4">
                {recentLimitChanges.map((change) => {
                  const cfg = ACTION_STYLE[change.action];
                  const ActionIcon = cfg.icon;
                  return (
                    <div key={change.id} className="flex items-center gap-4">
                      <ActionIcon className={`h-5 w-5 shrink-0 ${cfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-foreground">{change.player.name}</p>
                        <p className="text-[13px] font-medium text-muted-foreground mt-0.5">
                          {cfg.label}
                          {change.toGrade && ` → ${change.toGrade}`}
                        </p>
                      </div>
                      <Badge
                        className="text-xs shrink-0 px-2 py-1 bg-primary/10 text-primary border-primary/20"
                      >
                        {format(change.createdAt, "dd/MM", { locale: ptBR })}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
