import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { PageSkeleton } from "@/components/page-skeleton";
import { ritualsPageMetadata } from "@/lib/constants/metadata";
import { getRitualsPageData } from "@/lib/data/team/rituals-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = ritualsPageMetadata;

const RitualsPageClient = dynamicImport(
  () => import("@/components/team/rituals/rituals-page-client"),
  { loading: () => <PageSkeleton contentHeight="h-72" /> },
);

export default async function RitualsPage() {
  const data = await getRitualsPageData();
  return <RitualsPageClient {...data} />;
}
