"use server";

import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { gradeIdParamSchema } from "@/lib/schemas/grade";
import { gradesQueryRead } from "@/lib/queries/db/query-pipeline";
import { canEditGradeCoachNote, canManageGrades } from "@/lib/utils/auth-permissions";
import { mapPrismaRuleToCard } from "@/lib/utils/grade-rule-mapper";
import { fail } from "@/lib/constants/query-result";
import { ErrorTypes, Err } from "@/lib/types/primitives";
import type { AppSession } from "@/lib/types/auth";
import type { GradeDetailQueryData, GradeListRow } from "@/lib/types/grade/index";
import { gradeDetailInclude, gradeNameSelect, gradeProfileListInclude } from "./reads.const";

async function activeGradeIds(playerId: string) {
  return prisma.playerGradeAssignment
    .findMany({ where: { playerId, isActive: true }, select: { gradeId: true } })
    .then((a) => a.map((x) => x.gradeId));
}

async function forPlayerOrEmpty<T>(session: AppSession, withIds: (ids: string[]) => Promise<T[]>): Promise<T[]> {
  if (!session.playerId) return [];
  const ids = await activeGradeIds(session.playerId);
  return ids.length ? withIds(ids) : [];
}

export async function getGradesForSession(session: AppSession) {
  if (session.role !== UserRole.PLAYER) {
    return prisma.gradeProfile.findMany({ include: gradeProfileListInclude, orderBy: { createdAt: "desc" } });
  }
  return forPlayerOrEmpty(session, (ids) =>
    prisma.gradeProfile.findMany({
      where: { id: { in: ids } },
      include: gradeProfileListInclude,
      orderBy: { createdAt: "desc" },
    })
  );
}

export async function getGradeIdsAndNamesForSession(session: AppSession) {
  if (session.role !== UserRole.PLAYER) {
    return prisma.gradeProfile.findMany({ select: gradeNameSelect, orderBy: { createdAt: "desc" } });
  }
  return forPlayerOrEmpty(session, (ids) =>
    prisma.gradeProfile.findMany({
      where: { id: { in: ids } },
      select: gradeNameSelect,
      orderBy: { createdAt: "desc" },
    })
  );
}

export async function getGradeByIdForSession(session: AppSession, id: string) {
  const grade = await prisma.gradeProfile.findUnique({ where: { id }, include: gradeDetailInclude });
  if (!grade || session.role !== UserRole.PLAYER || !session.playerId) return grade;
  const assigned = await prisma.playerGradeAssignment.findFirst({
    where: { playerId: session.playerId, gradeId: id, isActive: true },
  });
  return assigned ? grade : null;
}

export async function getGradesListRowsForSession(session: AppSession): Promise<GradeListRow[]> {
  const grades = await getGradesForSession(session);
  return grades.map((g) => ({
    id: g.id,
    createdAt: g.createdAt,
    name: g.name,
    description: g.description,
    rulesCount: g._count.rules,
    assignmentsCount: g._count.assignments,
    assignedPlayers: [],
  }));
}

export async function getGradesListRowsAction(): Promise<{ ok: true; rows: GradeListRow[] } | Err> {
  const r = await gradesQueryRead.readData(getGradesListRowsForSession);
  return r.ok ? { ok: true, rows: r.data } : r;
}

export async function getGradeDetailQueryAction(
  gradeId: string
): Promise<{ ok: true; data: GradeDetailQueryData } | Err> {
  const p = gradeIdParamSchema.safeParse({ id: gradeId });
  if (!p.success) return fail(ErrorTypes.INVALID_DATA);
  const r = await gradesQueryRead.readData(async (session) => {
    const grade = await getGradeByIdForSession(session, p.data.id);
    if (!grade) throw new Error(ErrorTypes.NOT_FOUND);
    return {
      id: grade.id,
      name: grade.name,
      description: grade.description,
      assignmentsCount: grade._count.assignments,
      manageRules: canManageGrades(session),
      canEditNote: canEditGradeCoachNote(session),
      rules: grade.rules.map(mapPrismaRuleToCard),
      createdAt: grade.createdAt,
    } satisfies GradeDetailQueryData;
  });
  return r.ok ? { ok: true, data: r.data } : r;
}
