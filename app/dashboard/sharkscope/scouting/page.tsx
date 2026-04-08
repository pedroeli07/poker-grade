import dynamicImport from "next/dynamic";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canManageGrades } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { buildNetworkOptions } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scouting SharkScope",
  description: "Scouting de jogadores do SharkScope para os jogadores do time.",
};

const ScoutingClient = dynamicImport(
  () => import("./scouting-client").then((m) => ({ default: m.ScoutingClient })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-9 w-48 rounded-md bg-muted" />
        <div className="h-40 rounded-lg bg-muted" />
      </div>
    ),
  }
);



export default async function ScoutingPage() {
  const session = await requireSession();
  if (!canManageGrades(session)) redirect("/dashboard");

  const saved = await prisma.scoutingAnalysis.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      nick: true,
      network: true,
      rawData: true,
      nlqAnswer: true,
      notes: true,
      createdAt: true,
      savedBy: true,
    },
  });

  return (
    <ScoutingClient
      networkOptions={buildNetworkOptions()}
      savedAnalyses={saved.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      }))}
    />
  );
}
