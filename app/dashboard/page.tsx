import { requireSession } from "@/lib/auth/session";
import { Metadata } from "next";
import { DashboardPageView } from "./dashboard-page-view";
import { loadDashboardPageData } from "@/hooks/dashboard/dashboard-page-load";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Visão geral do time de jogadores.",
};

export default async function DashboardPage() {
  const session = await requireSession();
  const data = await loadDashboardPageData(session);
  return <DashboardPageView {...data} />;
}
