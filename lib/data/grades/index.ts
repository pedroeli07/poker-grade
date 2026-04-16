import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { AppSession } from "@/lib/auth/session";
import { requireSession } from "@/lib/auth/session";
import { getGradeByIdForSession, getGradesForSession } from "@/lib/queries/db/grade";
import {
  buildAssignedPlayersByGrade,
  canEditGradeCoachNote,
  canManageGrades,
  mapPrismaRuleToCard,
} from "@/lib/utils";
import { minhaGradePlayerInclude } from "@/lib/constants/player";
import { getCachedPlayerWithMinhaGradeInclude } from "@/lib/data/player/cached-by-id";
import type {
  GradeDetailClientProps,
  GradeDetailQueryData,
  GradeListRow,
  GradesListPageProps,
  PlayerProfileViewModel,
} from "@/lib/types";

export async function getGradesListRowsForSession(
  session: AppSession
): Promise<GradeListRow[]> {
  const grades = await getGradesForSession(session);
  const gradeIds = grades.map((g) => g.id);
  const activeAssignments =
    gradeIds.length === 0
      ? []
      : await prisma.playerGradeAssignment.findMany({
          where: { gradeId: { in: gradeIds }, isActive: true },
          select: {
            gradeId: true,
            player: { select: { id: true, name: true } },
          },
        });
  const byGrade = buildAssignedPlayersByGrade(activeAssignments);

  return grades.map((g) => {
    const assignedPlayers = byGrade.get(g.id) ?? [];
    return {
      id: g.id,
      createdAt: g.createdAt,
      name: g.name,
      description: g.description,
      rulesCount: g._count.rules,
      assignmentsCount: assignedPlayers.length,
      assignedPlayers,
    };
  });
}

export async function loadGradesListPageProps(
  session: AppSession
): Promise<GradesListPageProps> {
  const manage = canManageGrades(session);
  const rows = await getGradesListRowsForSession(session);
  return { rows, manage };
}

export async function getGradesPageProps() {
  const session = await requireSession();
  return loadGradesListPageProps(session);
}

export async function loadGradeDetailClientProps(
  session: AppSession,
  id: string
): Promise<GradeDetailClientProps | null> {
  const grade = await getGradeByIdForSession(session, id);
  if (!grade) return null;

  const initialData: GradeDetailQueryData = {
    id: grade.id,
    createdAt: grade.createdAt,
    name: grade.name,
    description: grade.description,
    assignmentsCount: grade._count.assignments,
    manageRules: canManageGrades(session),
    canEditNote: canEditGradeCoachNote(session),
    rules: grade.rules.map(mapPrismaRuleToCard),
  };

  return { gradeId: grade.id, initialData };
}

export async function getGradeDetailPageProps(id: string) {
  const session = await requireSession();
  return loadGradeDetailClientProps(session, id);
}

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

export type MinhaGradePagePlayer = Prisma.PlayerGetPayload<{
  include: typeof minhaGradePlayerInclude;
}>;

export async function loadMinhaGradePageData(playerId: string) {
  const player = await getCachedPlayerWithMinhaGradeInclude(playerId);

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
