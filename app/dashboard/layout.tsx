import { requireSession } from "@/lib/auth/session";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();
  return <DashboardShell>{children}</DashboardShell>;
}
