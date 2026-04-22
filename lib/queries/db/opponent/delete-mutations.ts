"use server";

import { prisma } from "@/lib/prisma";
import { canEditOpponentNote } from "@/lib/utils/auth-permissions";
import { deleteOpponentNoteSchema } from "@/lib/schemas/opponent";
import { fail } from "@/lib/constants/query-result";
import { ErrorTypes } from "@/lib/types/primitives";
import type { Ok, Err } from "@/lib/types/primitives";
import { createLogger } from "@/lib/logger";
import { runOpponentMutation } from "./mutation-helpers";

const log = createLogger("opponents.queries");

export async function deleteOpponentNote(id: string): Promise<Ok | Err> {
  const parsed = deleteOpponentNoteSchema.safeParse({ id });
  if (!parsed.success) return fail(ErrorTypes.INVALID_DATA);

  return runOpponentMutation(
    () => {},
    async (s) => {
      const note = await prisma.opponentNote.findUnique({
        where: { id: parsed.data.id },
        select: { id: true, authorId: true, deletedAt: true },
      });
      if (!note || note.deletedAt) throw new Error(ErrorTypes.NOT_FOUND);
      if (!canEditOpponentNote(s, note.authorId)) throw new Error(ErrorTypes.FORBIDDEN);

      await prisma.opponentNote.update({
        where: { id: parsed.data.id },
        data: { deletedAt: new Date() },
      });
      log.info("Nota removida (soft)", { id: parsed.data.id });
    }
  );
}
