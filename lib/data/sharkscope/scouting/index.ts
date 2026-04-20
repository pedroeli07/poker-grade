import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { buildNetworkOptions, canManageGrades } from "@/lib/utils";
import type { ScoutingClientProps } from "@/lib/types";

export async function loadScoutingClientProps(): Promise<ScoutingClientProps> {
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

  return {
    networkOptions: buildNetworkOptions(),
    savedAnalyses: saved.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
  };
}

export async function getScoutingPageProps() {
  const session = await requireSession();
  if (!canManageGrades(session)) redirect("/admin/dashboard");
  return loadScoutingClientProps();
}
