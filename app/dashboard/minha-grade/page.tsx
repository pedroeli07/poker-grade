import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { createLogger } from "@/lib/logger";

const log = createLogger("minha-grade.page");

import {
  ArrowUpCircle,
  Circle,
  ArrowDownCircle,
  DollarSign,
  Clock,
  Tag,
  Zap,
  Info,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Ban,
  Timer,
  AlertTriangle,
  CheckCircle2,
  CircleSlash,
  Repeat2,
} from "lucide-react";
import Link from "next/link";
import type { LobbyzeFilterItem } from "@/lib/types";

function parseJson<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

function Pill({
  text,
  variant,
}: {
  text: string;
  variant: "site" | "speed" | "format";
}) {
  const cls = {
    site: text.toLowerCase().includes("pokerstars")
      ? "bg-red-500/10 text-red-600 border-red-500/20"
      : "bg-blue-500/10 text-blue-600 border-blue-500/20",
    speed: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    format: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${cls}`}
    >
      {text}
    </span>
  );
}

const GRADE_TYPE_CONFIG = {
  ABOVE: {
    label: "Grade Acima",
    desc: "Disponível após cumprir os targets",
    icon: ArrowUpCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/5 border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  MAIN: {
    label: "Minha Grade",
    desc: "Grade atual - você está aqui",
    icon: Circle,
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20",
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  BELOW: {
    label: "Grade Abaixo",
    desc: "Grade de reconstrução se necessário",
    icon: ArrowDownCircle,
    color: "text-amber-500",
    bg: "bg-amber-500/5 border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
};

const TARGET_STATUS_CONFIG = {
  ON_TRACK: { icon: TrendingUp, color: "text-emerald-500", label: "Na meta" },
  ATTENTION: { icon: Minus, color: "text-amber-500", label: "Atenção" },
  OFF_TRACK: { icon: TrendingDown, color: "text-red-500", label: "Abaixo" },
};

async function getPlayerTournamentStats(playerId: string) {
  const rows = await prisma.$queryRaw<
    Array<{
      played: bigint;
      extra_play: bigint;
      didnt_play: bigint;
      reentries: bigint;
    }>
  >(Prisma.sql`
    SELECT
      COUNT(*) FILTER (WHERE LOWER(TRIM(COALESCE(scheduling, ''))) = 'played')::bigint AS played,
      COUNT(*) FILTER (WHERE LOWER(TRIM(COALESCE(scheduling, ''))) LIKE '%extra%')::bigint AS extra_play,
      COUNT(*) FILTER (WHERE NOT (
        LOWER(TRIM(COALESCE(scheduling, ''))) = 'played'
        OR LOWER(TRIM(COALESCE(scheduling, ''))) LIKE '%extra%'
      ))::bigint AS didnt_play,
      COUNT(*) FILTER (WHERE rebuy = true)::bigint AS reentries
    FROM played_tournaments
    WHERE "playerId" = ${playerId}
  `);
  const r = rows[0];
  return {
    played: Number(r?.played ?? 0),
    extraPlay: Number(r?.extra_play ?? 0),
    didntPlay: Number(r?.didnt_play ?? 0),
    reentries: Number(r?.reentries ?? 0),
  };
}

export const metadata = { title: "Minha Grade | CL Team" };

export default async function MinhaGradePage() {
  const session = await requireSession();

  log.info("Acesso a Minha Grade", {
    userId: session.userId,
    role: session.role,
    playerId: session.playerId ?? "none",
  });

  if (session.role !== "PLAYER") {
    log.warn("Acesso negado - role nao e PLAYER", {
      role: session.role,
      userId: session.userId,
    });
    redirect("/dashboard");
  }

  if (!session.playerId) {
    log.warn("PLAYER sem playerId vinculado", { userId: session.userId });
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Conta em análise</h2>
        <p className="text-muted-foreground max-w-md">
          Sua conta foi criada com sucesso. Aguarde enquanto um coach ou administrador vincula seu perfil de jogador.
        </p>
      </div>
    );
  }

  const player = await prisma.player.findUnique({
    where: { id: session.playerId },
    include: {
      coach: { select: { name: true } },
      gradeAssignments: {
        where: { isActive: true },
        include: {
          gradeProfile: {
            include: {
              rules: true,
              _count: { select: { rules: true } },
            },
          },
        },
        orderBy: { assignedAt: "desc" },
      },
      targets: {
        where: { isActive: true },
        orderBy: { category: "asc" },
      },
      limitChanges: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  if (!player) redirect("/dashboard");

  const [tourneyStats, pendingExtraReviews] = await Promise.all([
    getPlayerTournamentStats(player.id),
    prisma.gradeReviewItem.count({
      where: { playerId: player.id, status: "PENDING" },
    }),
  ]);

  const gradeOrder: ("ABOVE" | "MAIN" | "BELOW")[] = ["ABOVE", "MAIN", "BELOW"];
  const assignmentsByType = Object.fromEntries(
    gradeOrder.map((t) => [
      t,
      player.gradeAssignments.find((a) => a.gradeType === t),
    ])
  );

  const mainAssignment = assignmentsByType["MAIN"];
  const mainGrade = mainAssignment?.gradeProfile;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero header */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">
              CL Team
            </p>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              {player.name}
            </h1>
            {player.nickname && (
              <p className="text-muted-foreground mt-1 text-[15px]">
                @{player.nickname}
              </p>
            )}
            {player.coach && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                Coach:{" "}
                <span className="font-semibold text-foreground">
                  {player.coach.name}
                </span>
              </p>
            )}
          </div>

          {/* Grade path visual */}
          <div className="flex items-center gap-2 flex-wrap">
            {gradeOrder.map((type, i) => {
              const assignment = assignmentsByType[type];
              const cfg = GRADE_TYPE_CONFIG[type];
              const Icon = cfg.icon;
              const isMain = type === "MAIN";

              return (
                <div key={type} className="flex items-center gap-2">
                  {i > 0 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  )}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold ${
                      isMain
                        ? `${cfg.badge} ring-2 ring-primary/30`
                        : assignment
                          ? cfg.badge
                          : "bg-muted text-muted-foreground/50 border-border"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isMain ? cfg.color : ""}`} />
                    <span className="hidden sm:block text-xs">
                      {assignment
                        ? assignment.gradeProfile.name.split(" - ")[0]
                        : "?"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resumo: targets + importações Lobbyize */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-3">
            Resumo
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Link
            href="#meus-targets"
            className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4 transition-colors hover:bg-primary/[0.05] hover:border-primary/25"
          >
            <div className="flex items-center gap-2 text-primary mb-2">
              <Target className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Targets
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {player.targets.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">ativos</p>
          </Link>
          <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Extra plays
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {tourneyStats.extraPlay}
            </p>
            {pendingExtraReviews > 0 ? (
              <p className="text-[11px] text-primary/80 mt-1">
                {pendingExtraReviews} conferência
                {pendingExtraReviews !== 1 ? "ões" : ""} pendente
                {pendingExtraReviews !== 1 ? "s" : ""}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground mt-1">
                Lobbyize: extra play
              </p>
            )}
          </div>
          <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Torneios jogados
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {tourneyStats.played}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Played</p>
          </div>
          <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <CircleSlash className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Não jogados
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {tourneyStats.didntPlay}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Didn&apos;t play
            </p>
          </div>
          <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4 col-span-2 sm:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Repeat2 className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Reentradas
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {tourneyStats.reentries}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Torneios com rebuy
            </p>
          </div>
        </div>
      </div>

      {/* Coach note for main grade */}
      {mainGrade?.description && (
        <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-6 flex gap-5">
          <div className="shrink-0">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
              <Info className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-[13px] font-bold text-primary uppercase tracking-widest mb-2">
              Nota do Coach
            </p>
            <p className="text-[15px] text-foreground/80 leading-relaxed whitespace-pre-line">
              {mainGrade.description}
            </p>
          </div>
        </div>
      )}

      {/* Grades */}
      <div>
        <div className="flex items-center gap-4 mb-5">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-3">
            Suas grades
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-5">
          {gradeOrder.map((type) => {
            const assignment = assignmentsByType[type];
            const cfg = GRADE_TYPE_CONFIG[type];
            const Icon = cfg.icon;

            if (!assignment) {
              return (
                <div
                  key={type}
                  className="rounded-xl border border-dashed border-border p-5 flex items-center gap-3 text-muted-foreground/60"
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <p className="font-semibold text-sm">{cfg.label}</p>
                    <p className="text-xs">{cfg.desc}</p>
                  </div>
                </div>
              );
            }

            const grade = assignment.gradeProfile;
            const isMain = type === "MAIN";

            return (
              <div
                key={type}
                className={`rounded-2xl border overflow-hidden ${cfg.bg} ${
                  isMain ? "ring-2 ring-primary/20" : ""
                }`}
              >
                {/* Grade header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isMain
                          ? "bg-primary/10"
                          : type === "ABOVE"
                            ? "bg-emerald-500/10"
                            : "bg-amber-500/10"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badge}`}
                        >
                          {cfg.label}
                        </span>
                          {isMain && (
                            <span className="text-xs text-muted-foreground">
                              - você está aqui
                            </span>
                          )}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mt-1">
                        {grade.name}
                      </h3>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {grade._count.rules} filtro{grade._count.rules !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Rules - main grade expanded; others collapsed */}
                {isMain && grade.rules.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 p-6">
                    {grade.rules.map((rule, idx) => {
                      const sites = parseJson<LobbyzeFilterItem>(rule.sites);
                      const speed = parseJson<LobbyzeFilterItem>(rule.speed);
                      const variant = parseJson<LobbyzeFilterItem>(rule.variant);
                      const tournamentType = parseJson<LobbyzeFilterItem>(
                        rule.tournamentType
                      );

                      return (
                        <div
                          key={rule.id}
                          className="rounded-xl bg-background border border-border p-5 space-y-4"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-sm text-foreground">
                              {rule.filterName}
                            </span>
                          </div>

                          {sites.length > 0 && (
                            <div className="flex items-start gap-2.5">
                              <Zap className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              <div className="flex flex-wrap gap-1.5">
                                {sites.map((s, i) => (
                                  <Pill key={i} text={s.item_text} variant="site" />
                                ))}
                              </div>
                            </div>
                          )}

                          {(rule.buyInMin || rule.buyInMax) && (
                            <div className="flex items-center gap-2.5">
                              <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span className="font-mono text-lg font-bold text-emerald-600">
                                ${rule.buyInMin ?? "?"} - ${rule.buyInMax ?? "?"}
                              </span>
                            </div>
                          )}

                          {speed.length > 0 && (
                            <div className="flex items-start gap-2.5">
                              <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                              <div className="flex flex-wrap gap-1.5">
                                {speed.map((s, i) => (
                                  <Pill key={i} text={s.item_text} variant="speed" />
                                ))}
                              </div>
                            </div>
                          )}

                          {(variant.length > 0 || tournamentType.length > 0) && (
                            <div className="flex items-start gap-2.5">
                              <Tag className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                              <div className="flex flex-wrap gap-1.5">
                                {[...tournamentType, ...variant].map((s, i) => (
                                  <Pill
                                    key={i}
                                    text={s.item_text}
                                    variant="format"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {rule.prizePoolMin && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-3">
                              <TrendingUp className="h-4 w-4 text-emerald-500" />
                              GTD mín:{" "}
                              <strong className="text-foreground">
                                ${rule.prizePoolMin.toLocaleString()}
                              </strong>
                            </div>
                          )}
                          {rule.excludePattern && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-3">
                              <Ban className="h-4 w-4 text-red-500" />
                              Excluir:{" "}
                              <strong className="text-red-500/80">
                                {rule.excludePattern.replace(/\|/g, ", ")}
                              </strong>
                            </div>
                          )}
                          {rule.fromTime && rule.toTime && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-3">
                              <Timer className="h-4 w-4 text-primary/70" />
                              Horário: {rule.fromTime} - {rule.toTime}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isMain && (
                  <div className="px-6 py-4">
                    <p className="text-sm text-muted-foreground italic">
                      {cfg.desc}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Targets */}
      <div id="meus-targets">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-3">
              Meus targets
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {player.targets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-muted-foreground text-sm">
              Nenhum target ativo no momento. Seu coach pode cadastrar metas
              para você acompanhar.
            </div>
          ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {player.targets.map((target) => {
              const cfg = TARGET_STATUS_CONFIG[target.status];
              const StatusIcon = cfg.icon;
              const pct =
                target.numericValue && target.numericCurrent !== null
                  ? Math.min(
                      100,
                      Math.round(
                        (target.numericCurrent / target.numericValue) * 100
                      )
                    )
                  : null;

              return (
                <div
                  key={target.id}
                  className="rounded-xl border border-border bg-card p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[15px] text-foreground">
                        {target.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {target.category}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 ${cfg.color}`}>
                      <StatusIcon className="h-5 w-5" />
                      <span className="text-sm font-semibold">{cfg.label}</span>
                    </div>
                  </div>

                  {target.targetType === "NUMERIC" &&
                    target.numericValue != null && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Atual</span>
                          <span className="font-bold text-foreground">
                            {target.numericCurrent ?? "?"}
                            {target.unit && (
                              <span className="text-muted-foreground ml-0.5 font-normal">
                                {target.unit}
                              </span>
                            )}{" "}
                            <span className="text-muted-foreground font-normal">
                              / {target.numericValue}
                              {target.unit}
                            </span>
                          </span>
                        </div>
                        {pct !== null && (
                          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                target.status === "ON_TRACK"
                                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                  : target.status === "ATTENTION"
                                    ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                    : "bg-gradient-to-r from-red-500 to-red-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                        {pct !== null && (
                          <p className="text-xs text-right text-muted-foreground">
                            {pct}%
                          </p>
                        )}
                      </div>
                    )}

                  {target.coachNotes && (
                    <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
                      {target.coachNotes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          )}
      </div>

      {/* Limit history */}
      {player.limitChanges.length > 0 && (
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-3">
              Histórico de limites
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            {player.limitChanges.map((change) => {
              const isUp = change.action === "UPGRADE";
              const isDown = change.action === "DOWNGRADE";
              return (
                <div
                  key={change.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isUp
                        ? "bg-emerald-500/10"
                        : isDown
                          ? "bg-amber-500/10"
                          : "bg-muted"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                    ) : isDown ? (
                      <TrendingDown className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Minus className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-semibold text-[15px] ${
                        isUp
                          ? "text-emerald-600"
                          : isDown
                            ? "text-amber-600"
                            : "text-foreground"
                      }`}
                    >
                      {isUp ? "Promoção" : isDown ? "Ajuste" : "Mantido"}
                    </p>
                    {change.fromGrade && change.toGrade && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {change.fromGrade}{" "}
                        <span className="mx-1">→</span> {change.toGrade}
                      </p>
                    )}
                    {change.reason && (
                      <p className="text-sm text-muted-foreground/80 mt-1 italic">
                        {change.reason}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(change.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick link for player to see full grade detail */}
      {mainGrade && (
        <div className="flex justify-center">
          <Link
            href={`/dashboard/grades/${mainGrade.id}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Target className="h-4 w-4" />
            Ver detalhes completos da grade
          </Link>
        </div>
      )}
    </div>
  );
}
