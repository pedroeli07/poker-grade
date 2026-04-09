import dynamicImport from "next/dynamic";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils";
import { Metadata } from "next";
import { loadAnalyticsClientProps } from "../../../../hooks/sharkscope/analytics/analytics-page-load";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Analytics SharkScope",
  description: "Análise de performance do time por rede e período. Dados do cache.",
};

const AnalyticsClient = dynamicImport(
  () =>
    import("./analytics-client").then((m) => ({ default: m.AnalyticsClient })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-9 w-64 rounded-md bg-muted" />
        <div className="h-64 rounded-lg bg-muted" />
      </div>
    ),
  }
);

export default async function AnalyticsPage() {
  const session = await requireSession();
  if (!canWriteOperations(session)) redirect("/dashboard");

  const props = await loadAnalyticsClientProps();

  return <AnalyticsClient {...props} />;
}
