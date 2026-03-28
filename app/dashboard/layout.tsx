import { requireSession } from "@/lib/auth/session";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  return (
    <DashboardShell 
      userRole={session.role} 
      displayName={session.displayName}
      email={session.email}
    >
      {children}
    </DashboardShell>
  );
}
