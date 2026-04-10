import type { AppSession } from "@/lib/auth/session";
import { getGradeByIdForSession } from "@/lib/queries/db";
import {
  canEditGradeCoachNote,
  canManageGrades,
  mapPrismaRuleToCard,
} from "@/lib/utils";
import type { GradeDetailClientProps, GradeDetailQueryData } from "@/lib/types";

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
