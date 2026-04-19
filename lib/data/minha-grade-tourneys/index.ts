import { prisma } from "@/lib/prisma";
import { pokerNetworkKeyFromSiteLabel } from "@/lib/constants/poker-networks";

export type PlayerTourneyRow = {
  id: string;
  date: Date;
  site: string;
  siteNetworkKey: string | null;
  buyInCurrency: string | null;
  buyInValue: number;
  buyInUsd: number | null;
  tournamentName: string;
  scheduling: string | null;
  rebuy: boolean;
  speed: string | null;
  sharkId: string | null;
  priority: string | null;
  matchStatus: string;
};

export function siteToAppNetworkKey(site: string): string | null {
  return pokerNetworkKeyFromSiteLabel(site);
}

export async function loadPlayerTournamentHistory(playerId: string): Promise<PlayerTourneyRow[]> {
  const rows = await prisma.playedTournament.findMany({
    where: { playerId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      site: true,
      buyInCurrency: true,
      buyInValue: true,
      buyInUsd: true,
      tournamentName: true,
      scheduling: true,
      rebuy: true,
      speed: true,
      sharkId: true,
      priority: true,
      matchStatus: true,
    },
  });

  return rows.map((r) => ({
    ...r,
    siteNetworkKey: siteToAppNetworkKey(r.site),
  }));
}
