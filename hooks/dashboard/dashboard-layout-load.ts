import type { AppSession } from "@/lib/auth/session";
import { DashboardShellProps } from "@/lib/types";

export function loadDashboardShellProps(session: AppSession): DashboardShellProps {
  return {
    userRole: session.role,
    displayName: session.displayName,
    email: session.email,
  };
}
