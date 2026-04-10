import { prisma } from "@/lib/prisma";
import { buildNetworkOptions } from "@/lib/utils";
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
