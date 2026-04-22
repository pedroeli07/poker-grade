import { z } from "zod";

/** Manter alinhado com `POKER_NETWORKS` em `@/lib/constants/poker-networks`. */
const POKER_NETWORK_ENUM = [
  "gg",
  "pokerstars",
  "pokerstars_fr",
  "pokerstars_es",
  "pokerstars_pt",
  "888",
  "partypoker",
  "ipoker",
  "wpt",
  "coinpoker",
  "chico",
] as const;

export const zodPokerNetwork = z.enum(POKER_NETWORK_ENUM);

export const schemaCuid = z.cuid();

export const lobbyzeItemSchema = z.object({
  item_id: z.union([z.number(), z.string()]),
  item_text: z.string().min(1).max(200),
});

export const zodLobbyzeList = z.array(lobbyzeItemSchema);

export const zodEmail = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email().max(320));

export const zodName = z.string().trim().min(2).max(200);

export const zodDescription = z.string().max(2000).optional().nullable();

/** Para conteúdo HTML rico (editor WYSIWYG). */
export const zodRichDescription = z.string().max(50_000).optional().nullable();

export const zodCuidOptional = z
  .union([schemaCuid, z.literal("none"), z.literal("")])
  .optional()
  .nullable();

export function emptyToNullUnknown(v: unknown) {
  if (v === "" || v === undefined) return null;
  return v;
}
