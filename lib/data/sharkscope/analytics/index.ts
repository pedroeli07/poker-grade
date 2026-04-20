import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { canWriteOperations, sharkscopeStatsHasData } from "@/lib/utils";
import type { AnalyticsClientProps } from "@/lib/types";
import type { AnalyticsDebugPageData } from "@/lib/types";
import { getCachedSharkscopeAnalytics, loadAnalyticsPayloadForPlayer } from "./cache";

export * from "./cache";

export async function loadAnalyticsClientProps(): Promise<AnalyticsClientProps> {
  const p = await getCachedSharkscopeAnalytics();
  return {
    ...p,
    hasData30d: sharkscopeStatsHasData(p.stats30d),
    hasData90d: sharkscopeStatsHasData(p.stats90d),
  };
}

export async function getAnalyticsPageProps() {
  const session = await requireSession();
  if (!canWriteOperations(session)) redirect("/admin/dashboard");
  return loadAnalyticsClientProps();
}

export async function getAnalyticsDebugPageData(
  playerParam: string | undefined
): Promise<AnalyticsDebugPageData> {
  const session = await requireSession();
  if (!canWriteOperations(session)) redirect("/admin/dashboard");

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

  return {
    players,
    selectedPlayerId: row.id,
    playerMeta: { name: row.name, playerGroup: row.playerGroup! },
    analyticsProps: await loadAnalyticsPayloadForPlayer(row.id),
    listError: null,
  };
}
