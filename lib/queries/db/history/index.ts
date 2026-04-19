"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import {
  HISTORY_PAGE_SIZE_DEFAULT,
  loadHistoryPageData,
  type HistoryPageData,
} from "@/lib/data/history";
import { ErrorTypes } from "@/lib/types";

export async function getHistoryPage(
  page = 1,
  pageSize = HISTORY_PAGE_SIZE_DEFAULT
): Promise<HistoryPageData> {
  const session = await requireSession();
  return loadHistoryPageData(session, { page, pageSize });
}

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
  await prisma.limitChangeHistory.delete({ where: { id } });
  revalidatePath("/dashboard/history");
  return { ok: true };
}

export async function deleteHistoryItems(
  ids: string[]
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const check = await assertCanDelete(ids);
  if (!check.ok) return check;
  const { count } = await prisma.limitChangeHistory.deleteMany({
    where: { id: { in: check.ids } },
  });
  revalidatePath("/dashboard/history");
  return { ok: true, count };
}
