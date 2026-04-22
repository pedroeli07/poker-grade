import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { PageSkeleton } from "@/components/page-skeleton";
import { teamIndicatorsPageMetadata } from "@/lib/constants/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = teamIndicatorsPageMetadata;

const IndicatorsPageClient = dynamicImport(
  () => import("@/components/team/indicators/indicators-page-client"),
  {
    loading: () => <PageSkeleton contentHeight="h-72" />,
  },
);

export default function IndicatorsPage() {
  return <IndicatorsPageClient />;
}
