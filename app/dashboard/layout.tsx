import { requireSession } from "@/lib/auth/session";
import { DashboardShell } from "./dashboard-shell";
import { loadDashboardShellProps } from "../../hooks/dashboard/dashboard-layout-load";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const shellProps = loadDashboardShellProps(session);

  return (
    <DashboardShell {...shellProps}>
      {children}
    </DashboardShell>
  );
}
