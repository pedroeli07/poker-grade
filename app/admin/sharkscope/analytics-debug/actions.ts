"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils/auth-permissions";
import { runDailySyncSharkScope } from "@/lib/sharkscope/daily-sync/run-daily-sync";
import { ErrorTypes } from "@/lib/types/primitives";
export type SyncAnalyticsDebugResult =
  | {
      success: true;
      playerGroup: string;
      playerName: string;
      sharkHttpCalls: number;
      remainingSearches: number | null;
      processed: number;
      errors: number;
    }
  | { success: false; error: string };

/**
 * Modo `analytics_nick`: statistics 30d/90d (Player Group + nick×rede) **sem** `completedTournaments`
 * — poupa buscas vs `analytics`; aba Por site usa caches por nick.
 */
export async function syncAnalyticsDebugSinglePlayerAction(playerId: string): Promise<SyncAnalyticsDebugResult> {
  const session = await requireSession();
  if (!canWriteOperations(session)) {
    return { success: false, error: ErrorTypes.UNAUTHORIZED };
  }

  const id = playerId.trim();
  if (!id) {
    return { success: false, error: "Selecione um jogador." };
  }

  const player = await prisma.player.findFirst({
    where: { id, status: "ACTIVE", playerGroup: { not: null } },
    select: { name: true, playerGroup: true },
  });

  if (!player?.playerGroup) {
    return { success: false, error: "Jogador não encontrado ou sem Grupo Shark." };
  }

  const groupName = player.playerGroup.trim();

  try {
    const data = await runDailySyncSharkScope(true, {
      onlyPlayerGroup: groupName,
      syncMode: "analytics_nick",
    });
    revalidatePath("/admin/sharkscope/analytics-debug");
    revalidatePath("/admin/sharkscope/analises");

    return {
      success: true,
      playerGroup: groupName,
      playerName: player.name,
      sharkHttpCalls: data.sharkHttpCalls,
      remainingSearches: data.remainingSearches,
      processed: data.processed,
      errors: data.errors,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR;
    if (msg === ErrorTypes.SHARK_SYNC_CREDENTIALS_NOT_CONFIGURED) {
      return { success: false, error: msg };
    }
    return { success: false, error: msg };
  }
}
