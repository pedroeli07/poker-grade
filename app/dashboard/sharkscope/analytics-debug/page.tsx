import dynamicImport from "next/dynamic";
import AnalyticsPageSkeleton from "@/components/sharkscope/analytics/analytics-page-skeleton";
import { sharkscopeAnalyticsDebugPageMetadata } from "@/lib/constants/metadata";
import { getAnalyticsDebugPageData } from "@/lib/data/sharkscope/analytics";

export const dynamic = "force-dynamic";

export const metadata = sharkscopeAnalyticsDebugPageMetadata;

const AnalyticsDebugClient = dynamicImport(() => import("./analytics-debug-client"), {
  loading: () => <AnalyticsPageSkeleton />,
});

export default async function AnalyticsDebugPage({
  searchParams,
}: {
  searchParams: Promise<{ player?: string }>;
}) {
  const sp = await searchParams;
  const data = await getAnalyticsDebugPageData(sp.player);
  return <AnalyticsDebugClient {...data} />;
}
