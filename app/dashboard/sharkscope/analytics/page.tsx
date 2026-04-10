import dynamicImport from "next/dynamic";
import { sharkscopeAnalyticsPageMetadata } from "@/lib/constants/sharkscope-analytics-page";
import { getAnalyticsPageProps } from "@/lib/sharkscope/analytics-page-server";
import { AnalyticsPageSkeleton } from "@/components/sharkscope/analytics-page-skeleton";

export const dynamic = "force-dynamic";

export const metadata = sharkscopeAnalyticsPageMetadata;

const AnalyticsClient = dynamicImport(
  () => import("./analytics-client").then((m) => ({ default: m.AnalyticsClient })),
  { loading: () => <AnalyticsPageSkeleton /> }
);

export default async function AnalyticsPage() {
  const props = await getAnalyticsPageProps();
  return <AnalyticsClient {...props} />;
}
