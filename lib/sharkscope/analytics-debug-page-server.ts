import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils";
import { loadAnalyticsPayloadForPlayer } from "@/lib/data/sharkscope-analytics";
import type { AnalyticsClientProps } from "@/lib/types";

export type AnalyticsDebugPageData = {
  players: { id: string; name: string; playerGroup: string }[];
  selectedPlayerId: string | null;
  playerMeta: { name: string; playerGroup: string } | null;
  analyticsProps: AnalyticsClientProps | null;
  listError: string | null;
};

export async function getAnalyticsDebugPageData(playerParam: string | undefined): Promise<AnalyticsDebugPageData> {
  const session = await requireSession();
  if (!canWriteOperations(session)) redirect("/dashboard");

  const players = (
    await prisma.player.findMany({
      where: { status: "ACTIVE", playerGroup: { not: null } },
      select: { id: true, name: true, playerGroup: true },
      orderBy: { name: "asc" },
    })
  ).map((p) => ({
    id: p.id,
    name: p.name,
    playerGroup: p.playerGroup as string,
  }));

  const raw = playerParam?.trim() ?? "";
  if (!raw) {
    return {
      players,
      selectedPlayerId: null,
      playerMeta: null,
      analyticsProps: null,
      listError: null,
    };
  }

  const row = await prisma.player.findFirst({
    where: { id: raw, status: "ACTIVE", playerGroup: { not: null } },
    select: { id: true, name: true, playerGroup: true },
  });

  if (!row) {
    return {
      players,
      selectedPlayerId: null,
      playerMeta: null,
      analyticsProps: null,
      listError: "Jogador não encontrado ou sem grupo Shark.",
    };
  }

  const analyticsProps = await loadAnalyticsPayloadForPlayer(row.id);

  return {
    players,
    selectedPlayerId: row.id,
    playerMeta: { name: row.name, playerGroup: row.playerGroup! },
    analyticsProps,
    listError: null,
  };
}
