import { notFound } from "next/navigation";
import dynamicImport from "next/dynamic";
import { requireSession } from "@/lib/auth/session";
import { getGradeByIdForSession } from "@/lib/data/queries";
import { mapPrismaRuleToCard } from "@/lib/grades/map-prisma-rule-to-card";
import type { GradeDetailQueryData } from "@/lib/types";
import { Metadata } from "next";
import { canEditGradeCoachNote, canManageGrades } from "@/lib/utils";

const GradeDetailClient = dynamicImport(
  () =>
    import("./grade-detail-client").then((m) => ({
      default: m.GradeDetailClient,
    })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4 max-w-[min(100%,92rem)] mx-auto px-1">
        <div className="h-10 w-64 rounded-md bg-muted" />
        <div className="h-40 rounded-lg bg-muted" />
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          <div className="h-48 rounded-xl bg-muted" />
          <div className="h-48 rounded-xl bg-muted" />
        </div>
      </div>
    ),
  }
);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detalhes de uma Grade",
  description: "Visualize os detalhes de uma grade e filtros da Lobbyze.",
};

export default async function GradeRulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const grade = await getGradeByIdForSession(session, id);

  if (!grade) notFound();

  const initialData: GradeDetailQueryData = {
    id: grade.id,
    name: grade.name,
    description: grade.description,
    assignmentsCount: grade._count.assignments,
    manageRules: canManageGrades(session),
    canEditNote: canEditGradeCoachNote(session),
    rules: grade.rules.map(mapPrismaRuleToCard),
  };

  return <GradeDetailClient 
    gradeId={grade.id} 
    initialData={initialData} 
  />;
}
