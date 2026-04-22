import { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import DashboardShell from "../admin/dashboard-shell";
import { loadDashboardShellProps } from "../../hooks/dashboard/dashboard-layout-load";
import { SessionRefresher } from "@/components/session-refresher";
import JogadorPageSkeleton from "@/components/jogador/jogador-page-skeleton";

export default async function JogadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const shellProps = await loadDashboardShellProps(session);

  return (
    <DashboardShell {...shellProps}>
      <SessionRefresher />
      <Suspense fallback={<JogadorPageSkeleton />}>{children}</Suspense>
    </DashboardShell>
  );
}
