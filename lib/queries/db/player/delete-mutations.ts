"use server";

import { prisma } from "@/lib/prisma";
import { assertCanWrite } from "@/lib/auth/rbac";
import { idParamSchema } from "@/lib/schemas/auth";
import { notifyPlayerDeleted } from "@/lib/queries/db/notification/notify-accounts";
import { playerMutations, playerQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidatePlayers } from "@/lib/constants/revalidate-app";
import { UserRole } from "@prisma/client";
import { ErrorTypes } from "@/lib/types/primitives";

export async function deletePlayer(formData: FormData) {
  return playerMutations.run(assertCanWrite, async (session) => {
    const parsed = idParamSchema.safeParse({ id: formData.get("id") });
    if (!parsed.success) {
      playerQueriesLog.warn("deletePlayer validação Zod falhou");
      throw new Error(ErrorTypes.INVALID_DATA);
    }

    const existing = await prisma.player.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, coachId: true, driId: true, name: true },
    });
    if (!existing) throw new Error(ErrorTypes.NOT_FOUND);

    if (session.role === UserRole.COACH) {
      if (!session.coachId) throw new Error(ErrorTypes.FORBIDDEN);
      if (existing.coachId !== session.coachId && existing.driId !== session.coachId)
        throw new Error(ErrorTypes.FORBIDDEN);
    }

    try {
      await prisma.player.delete({ where: { id: parsed.data.id } });
    } catch (e) {
      playerQueriesLog.error("deletePlayer falhou", e instanceof Error ? e : undefined, { id: parsed.data.id });
      throw new Error("Não foi possível excluir o jogador.");
    }

    await notifyPlayerDeleted(existing.name);

    playerQueriesLog.success("Jogador excluído", { id: parsed.data.id, name: existing.name });
  }, (extra) => revalidatePlayers(...(extra ?? [])));
}
