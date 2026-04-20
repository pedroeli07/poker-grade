import { requireSession } from "@/lib/auth/session";
import DashboardShell from "../admin/dashboard-shell";
import { loadDashboardShellProps } from "../../hooks/dashboard/dashboard-layout-load";
import { SessionRefresher } from "@/components/session-refresher";

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
      {children}
    </DashboardShell>
  );
}
