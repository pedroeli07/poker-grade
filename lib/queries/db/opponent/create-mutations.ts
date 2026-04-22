"use server";

import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/utils/text-sanitize";
import { canCreateOpponentNote } from "@/lib/utils/auth-permissions";
import { createOpponentNoteSchema } from "@/lib/schemas/opponent";
import { fail } from "@/lib/constants/query-result";
import { ErrorTypes } from "@/lib/types/primitives";
import type { Ok, Err } from "@/lib/types/primitives";
import type { CreateOpponentNoteInput } from "@/lib/schemas/opponent";
import { createLogger } from "@/lib/logger";
import { runOpponentMutation } from "./mutation-helpers";
import { normalizeOpponentNickKey } from "./opponent-nick";

const log = createLogger("opponents.queries");

export async function createOpponentNote(input: CreateOpponentNoteInput): Promise<Ok | Err> {
  const parsed = createOpponentNoteSchema.safeParse(input);
  if (!parsed.success) return fail(ErrorTypes.INVALID_DATA);

  return runOpponentMutation(
    (s) => {
      if (!canCreateOpponentNote(s)) throw new Error(ErrorTypes.FORBIDDEN);
    },
    async (s) => {
      const body = sanitizeText(parsed.data.body, 5000);
      const nick = sanitizeText(parsed.data.nick, 120);
      if (!body || !nick) throw new Error(ErrorTypes.INVALID_DATA);

      await prisma.opponentNote.create({
        data: {
          network: parsed.data.network,
          nick,
          nickKey: normalizeOpponentNickKey(nick),
          body,
          classification: parsed.data.classification ?? null,
          style: parsed.data.style ?? null,
          authorId: s.userId,
        },
      });
      log.success("Nota criada", { network: parsed.data.network, nick });
    }
  );
}
