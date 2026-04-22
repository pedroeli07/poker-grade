import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { PageSkeleton } from "@/components/page-skeleton";
import { teamGovernancePageMetadata } from "@/lib/constants/metadata";
import { getGovernancePageData } from "@/lib/data/team/governance-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = teamGovernancePageMetadata;

const GovernancePageClient = dynamicImport(
  () => import("@/components/team/governance/governance-page-client"),
  {
    loading: () => <PageSkeleton contentHeight="h-72" />,
  },
);

export default async function GovernancePage() {
  const data = await getGovernancePageData();
  return <GovernancePageClient {...data} />;
}
