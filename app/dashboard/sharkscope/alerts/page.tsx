import dynamicImport from "next/dynamic";
import { AlertsPageSkeleton } from "@/components/sharkscope/alerts-page-skeleton";
import { sharkscopeAlertsPageMetadata } from "@/lib/constants/metadata";
import { getAlertsPageProps } from "@/lib/sharkscope/alerts-page-server";

export const dynamic = "force-dynamic";

export const metadata = sharkscopeAlertsPageMetadata;

const AlertsClient = dynamicImport(() => import("@/components/sharkscope/alerts/alerts-client"), {
  loading: () => <AlertsPageSkeleton />,
});

export default async function AlertsPage() {
  const props = await getAlertsPageProps();
  return <AlertsClient {...props} />;
}
