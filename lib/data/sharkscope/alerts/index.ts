import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getAlertLogsForSharkscopeDashboard } from "@/lib/queries/db/alert/reads";
import { canWriteOperations } from "@/lib/utils/auth-permissions";
import { AlertsClientProps } from "@/lib/types/sharkscope/alerts/index";
import { AppSession } from "@/lib/types/auth";
export async function loadAlertsClientProps(session: AppSession): Promise<AlertsClientProps> {
  const alerts = await getAlertLogsForSharkscopeDashboard(session);
  return {
    initialAlerts: alerts.map((a) => ({
      ...a,
      triggeredAt: a.triggeredAt.toISOString(),
      acknowledgedAt: a.acknowledgedAt?.toISOString() ?? null,
    })),
    canAcknowledge: canWriteOperations(session),
  };
}

export async function getAlertsPageProps() {
  const session = await requireSession();
  if (!canWriteOperations(session)) redirect("/admin/dashboard");
  return loadAlertsClientProps(session);
}
