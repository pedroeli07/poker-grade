import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { PlayerProfileViewModel } from "@/lib/types";

export const MINHA_GRADE_ORDER = ["ABOVE", "MAIN", "BELOW"] as const;
export type MinhaGradeTier = (typeof MINHA_GRADE_ORDER)[number];

export async function getPlayerTournamentStats(playerId: string) {
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

const playerInclude = {
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
    orderBy: { assignedAt: "desc" as const },
  },
  targets: {
    where: { isActive: true },
    orderBy: { category: "asc" as const },
  },
  limitChanges: {
    orderBy: { createdAt: "desc" as const },
    take: 3,
  },
} satisfies Prisma.PlayerInclude;

export type MinhaGradePagePlayer = Prisma.PlayerGetPayload<{ include: typeof playerInclude }>;

export async function loadMinhaGradePageData(playerId: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: playerInclude,
  });

  if (!player) return null;

  const [tourneyStats, pendingExtraReviews] = await Promise.all([
    getPlayerTournamentStats(player.id),
    prisma.gradeReviewItem.count({
      where: { playerId: player.id, status: "PENDING" },
    }),
  ]);

  const assignmentsByType = Object.fromEntries(
    MINHA_GRADE_ORDER.map((t) => [
      t,
      player.gradeAssignments.find((a) => a.gradeType === t),
    ])
  ) as PlayerProfileViewModel["assignmentsByType"];

  const mainAssignment = assignmentsByType["MAIN"];
  const mainGrade = mainAssignment?.gradeProfile;

  return {
    player,
    tourneyStats,
    pendingExtraReviews,
    assignmentsByType,
    gradeOrder: [...MINHA_GRADE_ORDER] satisfies MinhaGradeTier[],
    mainGrade,
  };
}
