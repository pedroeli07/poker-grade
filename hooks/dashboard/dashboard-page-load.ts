import type { AppSession } from "@/lib/auth/session";
import { canDeleteImports } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { UserRole, PlayerStatus, TargetStatus, ReviewStatus } from "@prisma/client";

export async function loadDashboardPageData(session: AppSession) {
  const [
    activePlayers,
    pendingReviews,
    recentImports,
    targetsStats,
    recentLimitChanges,
    alertCounts,
  ] = await Promise.all([
    prisma.player.count({ where: { status: PlayerStatus.ACTIVE } }),

    session.role === UserRole.PLAYER
      ? 0
      : prisma.gradeReviewItem.count({ where: { status: ReviewStatus.PENDING } }),

    prisma.tournamentImport.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.playerTarget.groupBy({
      by: ["status"],
      _count: true,
      where: { isActive: true },
    }),

    session.role === UserRole.PLAYER
      ? []
      : prisma.limitChangeHistory.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { player: { select: { name: true, nickname: true } } },
        }),

    session.role === UserRole.PLAYER
      ? { red: 0, yellow: 0 }
      : prisma.alertLog
          .groupBy({
            by: ["severity"],
            _count: true,
            where: { acknowledged: false },
          })
          .then((rows) => ({
            red: rows.find((r) => r.severity === "red")?._count ?? 0,
            yellow: rows.find((r) => r.severity === "yellow")?._count ?? 0,
          })),
  ]);

  const totalPlayed = recentImports.reduce(
    (s, i) => s + (i.matchedInGrade + i.outOfGrade),
    0
  );
  const inGrade = recentImports.reduce((s, i) => s + i.matchedInGrade, 0);
  const adherencePct =
    totalPlayed > 0 ? Math.round((inGrade / totalPlayed) * 100) : null;

  const onTrack =
    targetsStats.find((t) => t.status === TargetStatus.ON_TRACK)?._count ?? 0;
  const offTrack =
    targetsStats.find((t) => t.status === TargetStatus.OFF_TRACK)?._count ?? 0;

  return {
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
    showDeleteImport: canDeleteImports(session),
  };
}

export type DashboardPageData = Awaited<ReturnType<typeof loadDashboardPageData>>;
