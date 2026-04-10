import type { Metadata } from "next";
import { notFound } from "next/navigation";
import dynamicImport from "next/dynamic";
import { gradeDetailFallbackMetadata } from "@/lib/constants/grade-detail-page";
import { GradeDetailPageSkeleton } from "@/components/grades/grade-detail-page-skeleton";
import { getGradeDetailPageProps } from "@/lib/grades/grade-detail-page-server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const props = await getGradeDetailPageProps(id);
  if (!props) return gradeDetailFallbackMetadata;
  return {
    title: `${props.initialData.name} | Grade`,
    description:
      props.initialData.description ?? gradeDetailFallbackMetadata.description,
  };
}

const GradeDetailClient = dynamicImport(
  () =>
    import("./grade-detail-client").then((m) => ({
      default: m.GradeDetailClient,
    })),
  { loading: () => <GradeDetailPageSkeleton /> }
);

export default async function GradeDetailPage({ params }: Props) {
  const { id } = await params;
  const props = await getGradeDetailPageProps(id);
  if (!props) notFound();

  return (
    <GradeDetailClient gradeId={props.gradeId} initialData={props.initialData} />
  );
}
