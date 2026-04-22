"use server";

import { prisma } from "@/lib/prisma";
import { assertCanWrite } from "@/lib/auth/rbac";
import { deleteTargetIdsSchema, targetIdSchema } from "@/lib/schemas/player";
import {
  notifyTargetDeleted,
  notifyTargetsDeletedBatch,
} from "@/lib/queries/db/notification/notify-targets";
import { assertTargetWritableBySession } from "./reads";
import { targetMutations, targetsQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidateTargets } from "@/lib/constants/revalidate-app";
import { ErrorTypes } from "@/lib/types/primitives";

export async function deleteTarget(id: string) {
  return targetMutations.run(assertCanWrite, async (session) => {
    const parsed = targetIdSchema.safeParse(id);
    if (!parsed.success) throw new Error(ErrorTypes.INVALID_DATA);

    await assertTargetWritableBySession(session, parsed.data);

    const existing = await prisma.playerTarget.findUnique({
      where: { id: parsed.data },
      select: { playerId: true, name: true },
    });

    targetsQueriesLog.info("Excluindo target", { id: parsed.data });
    try {
      await prisma.playerTarget.delete({ where: { id: parsed.data } });
    } catch (e) {
      targetsQueriesLog.error("deleteTarget falhou", e instanceof Error ? e : undefined, { id: parsed.data });
      throw new Error(ErrorTypes.OPERATION_FAILED);
    }
    if (existing) await notifyTargetDeleted(existing.playerId, existing.name);
    targetsQueriesLog.success("Target excluído", { id: parsed.data });
  }, () => revalidateTargets());
}

/** Exclui vários targets de uma vez (mesma checagem de permissão que `deleteTarget`). */
export async function deleteTargets(ids: string[]) {
  const parsed = deleteTargetIdsSchema.safeParse([...new Set(ids)]);
  if (!parsed.success) throw new Error(ErrorTypes.INVALID_DATA);
  const unique = parsed.data;

  return targetMutations.run(
    assertCanWrite,
    async (session) => {
      for (const id of unique) {
        await assertTargetWritableBySession(session, id);
      }
      const existingRows = await prisma.playerTarget.findMany({
        where: { id: { in: unique } },
        select: { playerId: true, name: true },
      });
      targetsQueriesLog.info("Excluindo targets em lote", { count: unique.length });
      try {
        await prisma.playerTarget.deleteMany({ where: { id: { in: unique } } });
      } catch (e) {
        targetsQueriesLog.error("deleteTargets falhou", e instanceof Error ? e : undefined, { count: unique.length });
        throw new Error(ErrorTypes.OPERATION_FAILED);
      }
      await notifyTargetsDeletedBatch(
        existingRows.map((r) => ({ playerId: r.playerId, targetName: r.name }))
      );
      targetsQueriesLog.success("Targets excluídos", { count: unique.length });
    },
    () => revalidateTargets()
  );
}
