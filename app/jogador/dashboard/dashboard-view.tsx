import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Repeat2,
  ArrowRight,
  Layers,
  ListOrdered,
  History,
  FileSpreadsheet,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
import { accountNotificationsHref } from "@/lib/constants/navigation";
import { MinhaGradeHero } from "@/components/minha-grade/minha-grade-hero";
import { UserRole } from "@prisma/client";
import type { PlayerDashboardViewProps } from "@/lib/types/jogador";
import { schedulingDashboardTone } from "@/lib/jogador/scheduling-dashboard";
import { playerDashboardOnGradePct } from "@/lib/jogador/player-dashboard-view-model";

export function PlayerDashboardView({
  player,
  assignmentsByType,
  gradeOrder,
  tourneyStats,
  pendingExtraReviews,
  targetsCount,
  mainGradeName,
  unreadNotifications,
  recentTourneys,
}: PlayerDashboardViewProps) {
  const onGradePct = playerDashboardOnGradePct(tourneyStats.played, tourneyStats.extraPlay);
  const notifHref = accountNotificationsHref(UserRole.PLAYER);

  return (
    <div className="space-y-6">
      <MinhaGradeHero player={player} assignmentsByType={assignmentsByType} gradeOrder={gradeOrder} />

      <p className="text-sm text-muted-foreground -mt-2">
        Acesso rápido ao que importa — grade, torneios, metas e avisos.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-muted-foreground tracking-wide">Aderência</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{onGradePct != null ? `${onGradePct}%` : "—"}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              {tourneyStats.played + tourneyStats.extraPlay > 0
                ? `${tourneyStats.played} dentro da grade`
                : "Sem torneios importados"}
            </p>
          </CardContent>
        </Card>

        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-muted-foreground tracking-wide">Extra plays</CardTitle>
            <AlertTriangle
              className={`h-5 w-5 ${pendingExtraReviews > 0 ? "text-red-500" : "text-muted-foreground"}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{tourneyStats.extraPlay}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              {pendingExtraReviews > 0 ? `${pendingExtraReviews} aguardando coach` : "Tudo em dia"}
            </p>
          </CardContent>
        </Card>

        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-muted-foreground tracking-wide">Targets</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{targetsCount}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              <Link href="/jogador/metas" className="hover:text-primary transition-colors">
                Ver metas →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-muted-foreground tracking-wide">Reentradas</CardTitle>
            <Repeat2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{tourneyStats.reentries}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Torneios com rebuy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className={`col-span-full lg:col-span-4 ${cardClassName}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Torneios Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-[15px]">
              <Link href="/jogador/meus-torneios">
                Ver todos <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTourneys.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-[15px] border border-dashed border-border/50 rounded-lg gap-3">
                <FileSpreadsheet className="h-10 w-10 opacity-40" />
                Nenhum torneio importado ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {recentTourneys.map((t) => {
                  const tone = schedulingDashboardTone(t.scheduling);
                  return (
                    <div key={t.id} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold truncate text-foreground" title={t.tournamentName}>
                          {t.tournamentName}
                        </p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          {t.site} · {t.buyInCurrency ?? ""}
                          {Number.isFinite(t.buyInValue) ? t.buyInValue.toFixed(2) : "—"}
                        </p>
                      </div>
                      <Badge className={`text-xs shrink-0 ${tone.cls}`}>{tone.label}</Badge>
                      <span className="text-[12px] text-muted-foreground tabular-nums shrink-0 w-12 text-right">
                        {format(t.date, "dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`col-span-full lg:col-span-3 ${cardClassName}`}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Atalhos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href={notifHref}
              className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="relative shrink-0">
                <Bell className="h-5 w-5 text-primary" />
                {unreadNotifications > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Notificações</p>
                <p className="text-[12px] text-muted-foreground">
                  {unreadNotifications > 0
                    ? `${unreadNotifications} não lida${unreadNotifications !== 1 ? "s" : ""}`
                    : "Nenhuma pendente"}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/jogador/minha-grade"
              className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <Layers className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Minha grade</p>
                <p className="text-[12px] text-muted-foreground truncate">{mainGradeName ?? "Nenhuma grade principal"}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/jogador/meus-torneios"
              className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <ListOrdered className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Meus torneios</p>
                <p className="text-[12px] text-muted-foreground">
                  {tourneyStats.played + tourneyStats.extraPlay + tourneyStats.didntPlay} no total
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/jogador/metas"
              className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <Target className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Metas</p>
                <p className="text-[12px] text-muted-foreground">
                  {targetsCount} ativa{targetsCount !== 1 ? "s" : ""}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/jogador/historico"
              className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <History className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Histórico</p>
                <p className="text-[12px] text-muted-foreground">Movimentações de limite</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
