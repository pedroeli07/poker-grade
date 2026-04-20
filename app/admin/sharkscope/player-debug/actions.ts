"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils";
import { runDailySyncSharkScope } from "@/lib/sharkscope/run-daily-sync";
import { ErrorTypes } from "@/lib/types";

export type SyncSinglePlayerResult =
  | {
      success: true;
      playerGroup: string;
      playerName: string;
      syncMode: "full" | "light";
      sharkHttpCalls: number;
      remainingSearches: number | null;
      processed: number;
      errors: number;
      groupCountInDb: number;
      /** Estimativa grosseira: este sync × nº de grupos distintos (custo real varia por volume). */
      extrapolateCallsIfFullSync: number;
    }
  | { success: false; error: string };

/**
 * Mesmo núcleo do cron / botão global, mas só para o `playerGroup` deste jogador (poucas buscas vs. sync de toda a equipa).
 *
 * - `light` (recomendado para comparar com o site): só `statistics` lifetime + 10d/30d/90d — alinha ROI/FP/FT com a pesquisa manual.
 * - `full`: inclui `completedTournaments` + breakdown por rede e por tipo (mais caro).
 */
export async function syncSharkScopeSinglePlayerAction(
  playerId: string,
  syncMode: "full" | "light" = "light"
): Promise<SyncSinglePlayerResult> {
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
  const mode: "full" | "light" = syncMode === "full" ? "full" : "light";

  const groupCountInDb = (
    await prisma.player.groupBy({
      by: ["playerGroup"],
      where: { status: "ACTIVE", playerGroup: { not: null } },
    })
  ).length;

  try {
    const data = await runDailySyncSharkScope(true, { onlyPlayerGroup: groupName, syncMode: mode });
    revalidatePath("/admin/sharkscope/player-debug");
    revalidatePath("/admin/jogadores");
    revalidatePath("/admin/sharkscope/analises");

    const extrapolateCallsIfFullSync = data.sharkHttpCalls * groupCountInDb;

    return {
      success: true,
      playerGroup: groupName,
      playerName: player.name,
      syncMode: mode,
      sharkHttpCalls: data.sharkHttpCalls,
      remainingSearches: data.remainingSearches,
      processed: data.processed,
      errors: data.errors,
      groupCountInDb,
      extrapolateCallsIfFullSync,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR;
    if (msg === ErrorTypes.SHARK_SYNC_CREDENTIALS_NOT_CONFIGURED) {
      return { success: false, error: msg };
    }
    return { success: false, error: msg };
  }
}
