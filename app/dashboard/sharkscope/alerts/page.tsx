import dynamicImport from "next/dynamic";
import { sharkscopeAlertsPageMetadata } from "@/lib/constants/sharkscope-alerts-page";
import { AlertsPageSkeleton } from "@/components/sharkscope/alerts-page-skeleton";
import { getAlertsPageProps } from "@/lib/sharkscope/alerts-page-server";

export const dynamic = "force-dynamic";

export const metadata = sharkscopeAlertsPageMetadata;

const AlertsClient = dynamicImport(
  () => import("./alerts-client").then((m) => ({ default: m.AlertsClient })),
  { loading: () => <AlertsPageSkeleton /> }
);

export default async function AlertsPage() {
  const props = await getAlertsPageProps();
  return <AlertsClient {...props} />;
}
