import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Mail,
  AtSign,
  Grid3X3,
  AlertTriangle,
  History,
  ShieldCheck,
  Target,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { canViewPlayer } from "@/lib/utils";
import { GRADE_TYPE_LABEL, LIMIT_ACTION_CONFIG, TARGET_STATUS_CONFIG } from "@/lib/constants";


export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      coach: true,
      gradeAssignments: {
        where: { isActive: true },
        include: {
          gradeProfile: {
            include: { rules: true, _count: { select: { rules: true } } },
          },
        },
        orderBy: { assignedAt: "desc" },
      },
      targets: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
      limitChanges: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          playedTournaments: true,
          reviewItems: true,
        },
      },
    },
  });

  if (!player) notFound();
  if (!canViewPlayer(session, player)) redirect("/dashboard/players");

  const gradeOrder: ("ABOVE" | "MAIN" | "BELOW")[] = ["ABOVE", "MAIN", "BELOW"];
  const assignmentsByType = Object.fromEntries(
    gradeOrder.map((t) => [t, player.gradeAssignments.find((a) => a.gradeType === t)])
  );

  const onTrackCount = player.targets.filter((t) => t.status === "ON_TRACK").length;
  const attentionCount = player.targets.filter((t) => t.status === "ATTENTION").length;
  const offTrackCount = player.targets.filter((t) => t.status === "OFF_TRACK").length;

  const canManage =
    session.role === "ADMIN" ||
    session.role === "MANAGER" ||
    (session.role === "COACH" &&
      (player.coachId === session.coachId || player.driId === session.coachId));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild className="mt-0.5 shrink-0">
          <Link href="/dashboard/players">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold tracking-tight truncate">{player.name}</h2>
            <Badge
              className={
                player.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-muted text-muted-foreground"
              }
            >
              {player.status === "ACTIVE" ? "Ativo" : player.status === "INACTIVE" ? "Inativo" : "Suspenso"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {player.nickname && (
              <span className="flex items-center gap-1">
                <AtSign className="h-3.5 w-3.5" />
                {player.nickname}
              </span>
            )}
            {player.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {player.email}
              </span>
            )}
            {player.coach && (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                Coach: <strong className="text-foreground ml-0.5">{player.coach.name}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Grid3X3 className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Grades</span>
            </div>
            <div className="text-2xl font-bold">{player.gradeAssignments.length}</div>
            <p className="text-xs text-muted-foreground">atribuídas</p>
          </CardContent>
        </Card>

        <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Torneios</span>
            </div>
            <div className="text-2xl font-bold">{player._count.playedTournaments}</div>
            <p className="text-xs text-muted-foreground">importados</p>
          </CardContent>
        </Card>

        <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Revisões</span>
            </div>
            <div className="text-2xl font-bold">{player._count.reviewItems}</div>
            <p className="text-xs text-muted-foreground">pendências</p>
          </CardContent>
        </Card>

        <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Targets</span>
            </div>
            <div className="text-2xl font-bold">{player.targets.length}</div>
            <p className="text-xs text-muted-foreground">
              {onTrackCount > 0 && <span className="text-emerald-500">{onTrackCount} ok</span>}
              {attentionCount > 0 && <span className="text-amber-500 ml-1">{attentionCount} atenção</span>}
              {offTrackCount > 0 && <span className="text-red-500 ml-1">{offTrackCount} fora</span>}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grades — col esquerda (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Grades Atribuídas</h3>
            {canManage && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/grades">
                  <Grid3X3 className="mr-1.5 h-3.5 w-3.5" />
                  Gerenciar
                </Link>
              </Button>
            )}
          </div>

          {gradeOrder.map((type) => {
            const assignment = assignmentsByType[type];
            const cfg = GRADE_TYPE_LABEL[type];
            const GradeIcon = cfg.icon;

            if (!assignment) {
              return (
                <div
                  key={type}
                  className="rounded-xl border border-dashed border-border/60 p-4 flex items-center gap-3 text-muted-foreground"
                >
                  <GradeIcon className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{cfg.label} — não atribuída</span>
                </div>
              );
            }

            const grade = assignment.gradeProfile;
            return (
              <Card key={type} className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)] overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${cfg.color} text-xs`}>
                        <GradeIcon className="mr-1 h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs -mr-1">
                      <Link href={`/dashboard/grades/${grade.id}`}>Ver regras</Link>
                    </Button>
                  </div>
                  <CardTitle className="text-base mt-2">{grade.name}</CardTitle>
                  {grade.description && (
                    <CardDescription className="text-xs line-clamp-2">{grade.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Grid3X3 className="h-3 w-3" />
                      <strong className="text-foreground">{grade._count.rules}</strong> filtros
                    </span>
                    <span>
                      Atribuída em{" "}
                      {format(assignment.assignedAt, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  {assignment.notes && (
                    <p className="mt-2 text-xs text-muted-foreground italic border-t border-border pt-2">
                      {assignment.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Direita — Targets + Histórico */}
        <div className="space-y-6">
          {/* Targets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Targets</h3>
              <Link
                href="/dashboard/targets"
                className="text-xs text-primary hover:underline"
              >
                Ver todos
              </Link>
            </div>

            {player.targets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhum target definido.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {player.targets.map((target) => {
                  const cfg = TARGET_STATUS_CONFIG[target.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={target.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{target.name}</p>
                        <p className="text-xs text-muted-foreground">{target.category}</p>
                        {target.targetType === "NUMERIC" && target.numericValue != null && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs text-muted-foreground">Meta:</span>
                            <span className="text-xs font-semibold">
                              {target.numericCurrent ?? "—"} / {target.numericValue}
                              {target.unit && <span className="text-muted-foreground ml-0.5">{target.unit}</span>}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 shrink-0 ml-2 ${cfg.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-xs font-medium hidden sm:block">{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Histórico de limites */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-base font-semibold">Histórico de Limites</h3>
            </div>

            {player.limitChanges.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma alteração registrada.</p>
            ) : (
              <div className="space-y-2">
                {player.limitChanges.map((change) => {
                  const cfg = LIMIT_ACTION_CONFIG[change.action];
                  const ActionIcon = cfg.icon;
                  return (
                    <div key={change.id} className="flex items-start gap-2.5 text-sm">
                      <ActionIcon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                          {change.fromGrade && change.toGrade && (
                            <span className="text-xs text-muted-foreground">
                              {change.fromGrade} → {change.toGrade}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(change.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                          {change.reason && ` · ${change.reason}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
