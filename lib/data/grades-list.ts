import type { AppSession } from "@/lib/auth/session";
import { getGradesForSession } from "@/lib/queries/db";
import { prisma } from "@/lib/prisma";
import type { GradeListRow } from "@/lib/types";
import { buildAssignedPlayersByGrade } from "@/lib/utils";

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
