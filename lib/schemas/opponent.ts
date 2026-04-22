import { z } from "zod";
import { schemaCuid as cuid, zodPokerNetwork } from "./primitives";

const OPPONENT_CLASSIFICATIONS = ["FISH", "REG", "WHALE", "NIT", "SHARK", "UNKNOWN"] as const;
const OPPONENT_STYLES = ["LAG", "TAG", "PASSIVE", "AGGRESSIVE", "TIGHT", "LOOSE", "UNKNOWN"] as const;

export const zodOpponentClassification = z.enum(OPPONENT_CLASSIFICATIONS);
export const zodOpponentStyle = z.enum(OPPONENT_STYLES);

export const zodOpponentNick = z.string().trim().min(1).max(120);
export const zodOpponentBody = z.string().trim().min(1).max(5000);

export const createOpponentNoteSchema = z.object({
  network: zodPokerNetwork,
  nick: zodOpponentNick,
  body: zodOpponentBody,
  classification: zodOpponentClassification.optional().nullable(),
  style: zodOpponentStyle.optional().nullable(),
});

export const updateOpponentNoteSchema = z
  .object({
    id: cuid,
    body: zodOpponentBody,
    classification: zodOpponentClassification.optional().nullable(),
    style: zodOpponentStyle.optional().nullable(),
    /** Se ambos forem enviados, a nota é movida para outra rede/nick (corrige typos). */
    network: zodPokerNetwork.optional(),
    nick: zodOpponentNick.optional(),
  })
  .refine(
    (d) =>
      (d.network === undefined && d.nick === undefined) ||
      (d.network !== undefined && d.nick !== undefined),
    { message: "network e nick devem ser enviados juntos" }
  );

export const deleteOpponentNoteSchema = z.object({ id: cuid });

export const opponentListParamsSchema = z.object({
  network: zodPokerNetwork.optional().nullable(),
  search: z.string().trim().max(120).optional().nullable(),
});

export type CreateOpponentNoteInput = z.infer<typeof createOpponentNoteSchema>;
export type UpdateOpponentNoteInput = z.infer<typeof updateOpponentNoteSchema>;
