import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { loadGradeDetailClientProps } from "@/hooks/grades/grade-detail-page-load";
import { GradeDetailClient } from "./grade-detail-client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await requireSession();
  const props = await loadGradeDetailClientProps(session, id);
  if (!props) {
    return { title: "Grade | Gestão de Grades", description: "Regras e filtros da grade." };
  }
  return {
    title: `${props.initialData.name} | Grade`,
    description: props.initialData.description ?? "Regras e filtros da grade.",
  };
}

export default async function GradeDetailPage({ params }: Props) {
  const session = await requireSession();
  const { id } = await params;
  const props = await loadGradeDetailClientProps(session, id);
  if (!props) notFound();

  return <GradeDetailClient gradeId={props.gradeId} initialData={props.initialData} />;
}
