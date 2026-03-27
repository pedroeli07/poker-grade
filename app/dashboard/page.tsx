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
    UPGRADE: { label: "Subida", icon: TrendingUp, color: "text-primary" },
    MAINTAIN: { label: "Manutenção", icon: ArrowRight, color: "text-muted-foreground" },
    DOWNGRADE: { label: "Descida", icon: TrendingDown, color: "text-primary" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Overview</h2>
        <p className="text-muted-foreground mt-1">
          Visão geral do time de jogadores.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-300 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)] group hover:glow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-muted-foreground tracking-wide">Jogadores Ativos</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{activePlayers}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              <Link href="/dashboard/players" className="hover:text-primary transition-colors">
                Ver todos →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-300 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)] group hover:glow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-muted-foreground  tracking-wide">Aderência de Grade</CardTitle>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {adherencePct != null ? `${adherencePct}%` : "—"}
            </div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              {totalTournaments > 0
                ? `${inGrade} / ${totalTournaments} torneios recentes`
                : "Nenhuma importação ainda"}
            </p>
          </CardContent>
        </Card>

        <Card className={`bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-300 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)] group ${pendingReviews > 0 ? "hover:glow-primary" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-muted-foreground  tracking-wide">Revisões Pendentes</CardTitle>
            <AlertTriangle className={`h-5 w-5 ${pendingReviews > 0 ? "text-primary" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${pendingReviews > 0 ? "text-primary" : ""}`}>
              {pendingReviews}
            </div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
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

        <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-300 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)] group hover:glow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-muted-foreground  tracking-wide">Targets On Track</CardTitle>
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
        {/* Últimas importações */}
        <Card className="col-span-4 bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Importações Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-[15px]">
              <Link href="/dashboard/imports">
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
                  const pct =
                    imp.totalRows > 0
                      ? Math.round((imp.matchedInGrade / imp.totalRows) * 100)
                      : 0;
                  return (
                    <div key={imp.id} className="flex items-center gap-4">
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
                          {/* Progress bar */}
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[13px] font-bold text-muted-foreground shrink-0">{pct}%</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-semibold text-foreground">{imp.totalRows} torneios</p>
                        <p className="text-[12px] font-medium text-muted-foreground mt-0.5">
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
        <Card className="col-span-3 bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Movimentações de Limite</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-[15px]">
              <Link href="/dashboard/history">
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
