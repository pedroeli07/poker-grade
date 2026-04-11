import { requireSession } from "@/lib/auth/session";
import { DashboardPageView } from "./dashboard-page-view";
import { loadDashboardPageData } from "@/hooks/dashboard/dashboard-page-load";
import { dashboardPageMetadata } from "@/lib/constants/metadata";

export const dynamic = "force-dynamic";

export const metadata = dashboardPageMetadata;

export default async function DashboardPage() {
  const session = await requireSession();
  const data = await loadDashboardPageData(session);
  return <DashboardPageView {...data} />;
}
