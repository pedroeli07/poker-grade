"use server";

import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/utils/text-sanitize";
import { canEditOpponentNote } from "@/lib/utils/auth-permissions";
import { updateOpponentNoteSchema } from "@/lib/schemas/opponent";
import { fail } from "@/lib/constants/query-result";
import { ErrorTypes } from "@/lib/types/primitives";
import type { Ok, Err } from "@/lib/types/primitives";
import type { UpdateOpponentNoteInput } from "@/lib/schemas/opponent";
import { createLogger } from "@/lib/logger";
import { runOpponentMutation } from "./mutation-helpers";
import { normalizeOpponentNickKey } from "./opponent-nick";

const log = createLogger("opponents.queries");

export async function updateOpponentNote(input: UpdateOpponentNoteInput): Promise<Ok | Err> {
  const parsed = updateOpponentNoteSchema.safeParse(input);
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

      const body = sanitizeText(parsed.data.body, 5000);
      if (!body) throw new Error(ErrorTypes.INVALID_DATA);

      const identity =
        parsed.data.network !== undefined && parsed.data.nick !== undefined
          ? {
              network: parsed.data.network,
              nick: sanitizeText(parsed.data.nick, 120)!,
              nickKey: normalizeOpponentNickKey(parsed.data.nick),
            }
          : null;
      if (identity && (!identity.nick || !identity.nickKey)) throw new Error(ErrorTypes.INVALID_DATA);

      await prisma.opponentNote.update({
        where: { id: parsed.data.id },
        data: {
          body,
          classification: parsed.data.classification ?? null,
          style: parsed.data.style ?? null,
          ...(identity
            ? {
                network: identity.network,
                nick: identity.nick,
                nickKey: identity.nickKey,
              }
            : {}),
        },
      });
      log.info("Nota atualizada", { id: parsed.data.id });
    }
  );
}
