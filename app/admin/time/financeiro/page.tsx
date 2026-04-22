import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { PageSkeleton } from "@/components/page-skeleton";
import { teamFinancialPageMetadata } from "@/lib/constants/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = teamFinancialPageMetadata;

const FinancialPageClient = dynamicImport(
  () => import("@/components/team/financial/financial-page-client"),
  {
    loading: () => <PageSkeleton contentHeight="h-72" />,
  },
);

export default function FinancialPage() {
  return <FinancialPageClient />;
}
