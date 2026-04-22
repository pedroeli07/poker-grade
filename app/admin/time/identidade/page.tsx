import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { PageSkeleton } from "@/components/page-skeleton";
import { getIdentityPageData } from "@/lib/data/team/identity-page";
import { identityPageMetadata } from "@/lib/constants/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = identityPageMetadata;

const IdentityPageClient = dynamicImport(
  () => import("@/components/team/identidade/identity-page-client"),
  {
    loading: () => <PageSkeleton contentHeight="h-72" />,
  },
);

export default async function AdminIdentityPage() {
  const data = await getIdentityPageData();
  return <IdentityPageClient {...data} />;
}
