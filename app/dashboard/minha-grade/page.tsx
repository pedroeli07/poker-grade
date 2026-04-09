import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { createLogger } from "@/lib/logger";
import { Metadata } from "next";

const log = createLogger("minha-grade.page");

import Link from "next/link";
import { Target, Info } from "lucide-react";

import type { PlayerProfileViewModel } from "@/lib/types";
import { MinhaGradeHero } from "@/components/minha-grade/minha-grade-hero";
import { MinhaGradeStats } from "@/components/minha-grade/minha-grade-stats";
import { MinhaGradeList } from "@/components/minha-grade/minha-grade-list";
import { MinhaGradeTargets } from "@/components/minha-grade/minha-grade-targets";
import { MinhaGradeLimits } from "@/components/minha-grade/minha-grade-limits";

export const metadata: Metadata = {
  title: "Minha Grade",
  description: "Visualize sua grade atual e histórico de subidas, manutenções e descidas.",
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

export const dynamic = "force-dynamic";

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
      <MinhaGradeHero
        player={player}
        assignmentsByType={assignmentsByType as PlayerProfileViewModel["assignmentsByType"]}
        gradeOrder={gradeOrder}
      />

      <MinhaGradeStats
        targetsCount={player.targets.length}
        tourneyStats={tourneyStats}
        pendingExtraReviews={pendingExtraReviews}
      />

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

      <MinhaGradeList
        gradeOrder={gradeOrder}
        assignmentsByType={assignmentsByType as PlayerProfileViewModel["assignmentsByType"]}
      />

      <MinhaGradeTargets targets={player.targets} />

      <MinhaGradeLimits limitChanges={player.limitChanges} />

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
