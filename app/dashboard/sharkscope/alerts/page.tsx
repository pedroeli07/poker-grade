import dynamicImport from "next/dynamic";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils";
import { getAlertLogsForSharkscopeDashboard } from "@/lib/data/queries";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Alertas SharkScope",
  description: "Alertas de performance do SharkScope para os jogadores do time.",
};

const AlertsClient = dynamicImport(
  () => import("./alerts-client").then((m) => ({ default: m.AlertsClient })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-9 w-56 rounded-md bg-muted" />
        <div className="h-72 rounded-lg bg-muted" />
      </div>
    ),
  }
);

export default async function AlertsPage() {
  const session = await requireSession();
  if (!canWriteOperations(session)) redirect("/dashboard");

  const alerts = await getAlertLogsForSharkscopeDashboard(session);

  return (
    <AlertsClient
      initialAlerts={alerts.map((a) => ({
        ...a,
        triggeredAt: a.triggeredAt.toISOString(),
        acknowledgedAt: a.acknowledgedAt?.toISOString() ?? null,
      }))}
      canAcknowledge={canWriteOperations(session)}
    />
  );
}
