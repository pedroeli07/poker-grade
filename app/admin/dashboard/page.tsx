import { requireSession } from "@/lib/auth/session";
import { DashboardPageView } from "../dashboard-page-view";
import { loadDashboardPageData } from "@/hooks/dashboard/dashboard-page-load";
import { dashboardPageMetadata } from "@/lib/constants/metadata";
import { logPerf, withPerf } from "@/lib/utils/perf";

export const dynamic = "force-dynamic";

export const metadata = dashboardPageMetadata;

export default async function DashboardPage() {
  return withPerf("app.route", "/admin/dashboard", async () => {
    const tSession = performance.now();
    const session = await requireSession();
    logPerf("app.route", "/admin/dashboard.requireSession", tSession);

    const tData = performance.now();
    const data = await loadDashboardPageData(session);
    logPerf("app.route", "/admin/dashboard.loadDashboardPageData", tData);

    return <DashboardPageView {...data} />;
  });
}
