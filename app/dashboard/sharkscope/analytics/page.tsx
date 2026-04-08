import dynamicImport from "next/dynamic";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils";
import { getCachedSharkscopeAnalytics } from "@/lib/data/sharkscope-analytics";
import { sharkscopeStatsHasData } from "@/lib/sharkscope/ui-helpers";
import { Metadata } from "next";

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

  const { stats30d, stats90d, ranking, tierStats30d, typeStats30d } = await getCachedSharkscopeAnalytics();

  return (
    <AnalyticsClient
      stats30d={stats30d}
      stats90d={stats90d}
      ranking={ranking}
      tierStats30d={tierStats30d}
      typeStats30d={typeStats30d}
      hasData30d={sharkscopeStatsHasData(stats30d)}
      hasData90d={sharkscopeStatsHasData(stats90d)}
    />
  );
}
