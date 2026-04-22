import { cache } from "react";
import { notFound } from "next/navigation";
import dynamicImport from "next/dynamic";
import type { Metadata } from "next";
import { gradeDetailFallbackMetadata } from "@/lib/constants/metadata";
import GradeDetailPageSkeleton from "@/components/grades/grade-detail-page-skeleton";
import { getGradeDetailPageProps } from "@/lib/data/grades";
import type { GenerateMetadataProps } from "@/lib/types/primitives";
export const dynamic = "force-dynamic";

const resolveProps = cache(async (params: GenerateMetadataProps["params"]) => {
  const { id } = await params;
  return getGradeDetailPageProps(id);
});

const GradeDetailClient = dynamicImport(() => import("./grade-detail-client"), {
  loading: () => <GradeDetailPageSkeleton />,
});

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const props = await resolveProps(params);
  if (!props) return gradeDetailFallbackMetadata;
  return {
    title: `${props.initialData.name} | Grade`,
    description: props.initialData.description ?? gradeDetailFallbackMetadata.description,
  };
}

export default async function GradeDetailPage({ params }: GenerateMetadataProps) {
  const props = await resolveProps(params);
  if (!props) notFound();
  return <GradeDetailClient gradeId={props.gradeId} initialData={props.initialData} />;
}