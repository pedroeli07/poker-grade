import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { PageSkeleton } from "@/components/page-skeleton";
import { executionPageMetadata } from "@/lib/constants/metadata";
import { getExecutionPageData } from "@/lib/data/team/execution-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = executionPageMetadata;

const ExecutionPageClient = dynamicImport(
  () => import("@/components/team/execution/execution-page-client"),
  {
    loading: () => <PageSkeleton contentHeight="h-72" />,
  },
);

export default async function ExecutionPage() {
  const data = await getExecutionPageData();
  return <ExecutionPageClient {...data} />;
}
