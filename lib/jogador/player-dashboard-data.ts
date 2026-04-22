import { prisma } from "@/lib/prisma";
import type { RecentTourneyDashboardRow } from "@/lib/types/jogador";

export async function loadRecentTourneysForDashboard(playerId: string): Promise<RecentTourneyDashboardRow[]> {
  const rows = await prisma.playedTournament.findMany({
    where: { playerId },
    orderBy: { date: "desc" },
    take: 5,
    select: {
      id: true,
      date: true,
      tournamentName: true,
      site: true,
      buyInCurrency: true,
      buyInValue: true,
      scheduling: true,
    },
  });
  return rows;
}
