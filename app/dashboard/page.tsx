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
} from "lucide-react";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await requireSession();

  const [
    activePlayers,
    pendingReviews,
    recentImports,
    targetsStats,
    recentLimitChanges,
  ] = await Promise.all([
    prisma.player.count({ where: { status: "ACTIVE" } }),

    session.role === "PLAYER"
      ? 0
      : prisma.gradeReviewItem.count({ where: { status: "PENDING" } }),

    prisma.tournamentImport.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.playerTarget.groupBy({
      by: ["status"],
      _count: true,
      where: { isActive: true },
    }),

    session.role === "PLAYER"
      ? []
      : prisma.limitChangeHistory.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { player: { select: { name: true, nickname: true } } },
        }),
  ]);

  const totalTournaments = recentImports.reduce((s, i) => s + i.totalRows, 0);
  const inGrade = recentImports.reduce((s, i) => s + i.matchedInGrade, 0);
  const adherencePct = totalTournaments > 0 ? Math.round((inGrade / totalTournaments) * 100) : null;

  const onTrack = targetsStats.find((t) => t.status === "ON_TRACK")?._count ?? 0;
  const offTrack = targetsStats.find((t) => t.status === "OFF_TRACK")?._count ?? 0;

  const ACTION_STYLE = {
    UPGRADE: { label: "Subida", icon: TrendingUp, color: "text-emerald-500" },
    MAINTAIN: { label: "Manutenção", icon: ArrowRight, color: "text-muted-foreground" },
    DOWNGRADE: { label: "Descida", icon: TrendingDown, color: "text-red-500" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-1">
          Visão geral do time de jogadores.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card group hover:glow-primary transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jogadores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlayers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/dashboard/players" className="hover:text-primary transition-colors">
                Ver todos →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card group hover:glow-success transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aderência de Grade</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {adherencePct != null ? `${adherencePct}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTournaments > 0
                ? `${inGrade} / ${totalTournaments} torneios nas últimas importações`
                : "Nenhuma importação ainda"}
            </p>
          </CardContent>
        </Card>

        <Card className={`glass-card group transition-all duration-300 ${pendingReviews > 0 ? "hover:glow-amber" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revisões Pendentes</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${pendingReviews > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pendingReviews > 0 ? "text-amber-500" : ""}`}>
              {pendingReviews}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingReviews > 0 ? (
                <Link href="/dashboard/review" className="hover:text-primary transition-colors">
                  Revisar agora →
                </Link>
              ) : (
                "Tudo em dia"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card group hover:glow-primary transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Targets On Track</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onTrack}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {offTrack > 0 ? (
                <span className="text-red-500">{offTrack} fora da meta</span>
              ) : (
                "Todos na meta"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Últimas importações */}
        <Card className="col-span-4 glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Importações Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/imports">
                Ver todas <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentImports.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-sm border border-dashed border-border/50 rounded-lg gap-2">
                <Grid3X3 className="h-8 w-8 opacity-40" />
                Nenhuma importação realizada ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {recentImports.map((imp) => {
                  const pct =
                    imp.totalRows > 0
                      ? Math.round((imp.matchedInGrade / imp.totalRows) * 100)
                      : 0;
                  return (
                    <div key={imp.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{imp.fileName}</p>
                          {imp.playerName && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              · {imp.playerName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {/* Progress bar */}
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 90
                                  ? "bg-emerald-500"
                                  : pct >= 70
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium">{imp.totalRows} torneios</p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(imp.createdAt, "dd/MM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimas movimentações de limite */}
        <Card className="col-span-3 glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Movimentações de Limite</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/history">
                Ver histórico <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentLimitChanges.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-sm border border-dashed border-border/50 rounded-lg gap-2">
                <TrendingUp className="h-8 w-8 opacity-40" />
                Nenhuma movimentação recente.
              </div>
            ) : (
              <div className="space-y-3">
                {recentLimitChanges.map((change) => {
                  const cfg = ACTION_STYLE[change.action];
                  const ActionIcon = cfg.icon;
                  return (
                    <div key={change.id} className="flex items-center gap-3">
                      <ActionIcon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{change.player.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cfg.label}
                          {change.toGrade && ` → ${change.toGrade}`}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs shrink-0 ${
                          change.action === "UPGRADE"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : change.action === "DOWNGRADE"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
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
