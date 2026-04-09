import type { AppSession } from "@/lib/auth/session";
import { getAlertLogsForSharkscopeDashboard } from "@/lib/queries/db";
import { canWriteOperations } from "@/lib/utils";
import type { AlertsClientProps } from "@/lib/types";

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
