"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import { notifyHistoryDeleted } from "@/lib/queries/db/notification/notify-history-deleted";
import { ErrorTypes } from "@/lib/types/primitives";

async function assertCanDelete(ids: string[]) {
  const session = await requireSession();
  if (!ids.length) return { ok: false as const, error: ErrorTypes.INVALID_DATA };

  const rows = await prisma.limitChangeHistory.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      playerId: true,
      player: { select: { coachId: true, driId: true } },
    },
  });

  if (rows.length !== ids.length) return { ok: false as const, error: ErrorTypes.NOT_FOUND };

  if (session.role === UserRole.PLAYER) {
    if (!session.playerId) return { ok: false as const, error: ErrorTypes.FORBIDDEN };
    const allMine = rows.every((r) => r.playerId === session.playerId);
    if (!allMine) return { ok: false as const, error: ErrorTypes.FORBIDDEN };
  } else if (session.role === UserRole.COACH) {
    if (!session.coachId) return { ok: false as const, error: ErrorTypes.FORBIDDEN };
    const allMine = rows.every(
      (r) => r.player.coachId === session.coachId || r.player.driId === session.coachId
    );
    if (!allMine) return { ok: false as const, error: ErrorTypes.FORBIDDEN };
  }
  return { ok: true as const, ids: rows.map((r) => r.id) };
}

export async function deleteHistoryItem(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const check = await assertCanDelete([id]);
  if (!check.ok) return check;
  const row = await prisma.limitChangeHistory.findUnique({
    where: { id },
    select: { playerId: true, player: { select: { name: true } } },
  });
  await prisma.limitChangeHistory.delete({ where: { id } });
  if (row) {
    await notifyHistoryDeleted([
      { playerId: row.playerId, playerName: row.player?.name ?? "Jogador" },
    ]);
  }
  revalidatePath("/admin/grades/historico");
  return { ok: true };
}

export async function deleteHistoryItems(
  ids: string[]
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const check = await assertCanDelete(ids);
  if (!check.ok) return check;
  const rows = await prisma.limitChangeHistory.findMany({
    where: { id: { in: check.ids } },
    select: { playerId: true, player: { select: { name: true } } },
  });
  const { count } = await prisma.limitChangeHistory.deleteMany({
    where: { id: { in: check.ids } },
  });
  await notifyHistoryDeleted(
    rows.map((r) => ({ playerId: r.playerId, playerName: r.player?.name ?? "Jogador" })),
  );
  revalidatePath("/admin/grades/historico");
  return { ok: true, count };
}
