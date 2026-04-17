import type { AppSession } from "@/lib/types";
import { canDeleteImports } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { UserRole, PlayerStatus, TargetStatus, ReviewStatus } from "@prisma/client";
import { logPerf, timed } from "@/lib/utils/perf";

export async function loadDashboardPageData(session: AppSession) {
  const tLoad = performance.now();
  const [
    activePlayers,
    pendingReviews,
    recentImports,
    targetsStats,
    recentLimitChanges,
    alertCounts,
  ] = await Promise.all([
    timed("dashboard.load", "activePlayers", prisma.player.count({ where: { status: PlayerStatus.ACTIVE } })),

    timed(
      "dashboard.load",
      "pendingReviews",
      session.role === UserRole.PLAYER
        ? Promise.resolve(0)
        : prisma.gradeReviewItem.count({ where: { status: ReviewStatus.PENDING } })
    ),

    timed(
      "dashboard.load",
      "recentImports",
      prisma.tournamentImport.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    ),

    timed(
      "dashboard.load",
      "targetsStats",
      prisma.playerTarget.groupBy({
        by: ["status"],
        _count: true,
        where: { isActive: true },
      })
    ),

    timed(
      "dashboard.load",
      "recentLimitChanges",
      session.role === UserRole.PLAYER
        ? Promise.resolve([])
        : prisma.limitChangeHistory.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { player: { select: { name: true, nickname: true } } },
          })
    ),

    timed(
      "dashboard.load",
      "alertCounts",
      session.role === UserRole.PLAYER
        ? Promise.resolve({ red: 0, yellow: 0 })
        : prisma.alertLog
            .groupBy({
              by: ["severity"],
              _count: true,
              where: { acknowledged: false },
            })
            .then((rows) => ({
              red: rows.find((r) => r.severity === "red")?._count ?? 0,
              yellow: rows.find((r) => r.severity === "yellow")?._count ?? 0,
            }))
    ),
  ]);
  logPerf("dashboard.load", "parallel.total", tLoad, { role: session.role });

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
