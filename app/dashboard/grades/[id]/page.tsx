import type { Metadata } from "next";
import { notFound } from "next/navigation";
import dynamicImport from "next/dynamic";
import { gradeDetailFallbackMetadata } from "@/lib/constants/metadata";
import GradeDetailPageSkeleton from "@/components/grades/grade-detail-page-skeleton";
import { getGradeDetailPageProps } from "@/lib/grades/grade-detail-page-server";
import { GenerateMetadataProps } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const { id } = await params;
  const props = await getGradeDetailPageProps(id);
  if (!props) return gradeDetailFallbackMetadata;
  return {
    title: `${props.initialData.name} | Grade`,
    description:
      props.initialData.description ?? gradeDetailFallbackMetadata.description,
  };
}

const GradeDetailClient = dynamicImport(() => import("./grade-detail-client"), {
  loading: () => <GradeDetailPageSkeleton />,
});

export default async function GradeDetailPage({ params }: GenerateMetadataProps) {
  const { id } = await params;
  const props = await getGradeDetailPageProps(id);
  if (!props) notFound();

  return (
    <GradeDetailClient gradeId={props.gradeId} initialData={props.initialData} />
  );
}
