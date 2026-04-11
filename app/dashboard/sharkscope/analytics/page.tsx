import dynamicImport from "next/dynamic";
import { getAnalyticsPageProps } from "@/lib/sharkscope/analytics-page-server";
import { AnalyticsPageSkeleton } from "@/components/sharkscope/analytics-page-skeleton";
import { sharkscopeAnalyticsPageMetadata } from "@/lib/constants/metadata";

export const dynamic = "force-dynamic";

export const metadata = sharkscopeAnalyticsPageMetadata;

const AnalyticsClient = dynamicImport(() => import("./analytics-client"), {
  loading: () => <AnalyticsPageSkeleton />,
});

export default async function AnalyticsPage() {
  const props = await getAnalyticsPageProps();
  return <AnalyticsClient {...props} />;
}
