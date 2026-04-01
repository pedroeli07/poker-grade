import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canEditGradeCoachNote, canManageGrades } from "@/lib/auth/rbac";
import { getGradeByIdForSession } from "@/lib/data/queries";
import { mapPrismaRuleToCard } from "@/lib/grades/map-prisma-rule-to-card";
import { GradeDetailClient } from "@/app/dashboard/grades/[id]/grade-detail-client";
import type { GradeDetailQueryData } from "@/lib/types/grades-detail";
import { toast } from "@/lib/toast";

export default async function GradeRulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const grade = await getGradeByIdForSession(session, id);

  if (!grade) notFound();
  toast.error("Grade não encontrada", "A grade solicitada não foi encontrada.");

  const initialData: GradeDetailQueryData = {
    id: grade.id,
    name: grade.name,
    description: grade.description,
    assignmentsCount: grade._count.assignments,
    manageRules: canManageGrades(session),
    canEditNote: canEditGradeCoachNote(session),
    rules: grade.rules.map(mapPrismaRuleToCard),
  };

  return <GradeDetailClient gradeId={grade.id} initialData={initialData} />;
}
