import { z } from "zod";
import { PlayerStatus } from "@prisma/client";
import { schemaCuid as cuid, zodPokerNetwork, zodEmail, zodName, zodCuidOptional } from "./primitives";

export const createPlayerFormSchema = z.object({
  name: zodName,
  nickname: z.string().max(120).optional().nullable(),
  email: z.union([zodEmail, z.literal("")]).optional(),
  coachId: zodCuidOptional,
  mainGradeId: zodCuidOptional,
  abiAlvoValue: z.string().max(40).optional().transform((s) => s ?? ""),
  abiAlvoUnit: z.string().max(30).optional().transform((s) => s ?? ""),
  playerGroup: z.string().max(120).optional().nullable(),
  nicksData: z.string().optional().nullable(),
});

export const updatePlayerFormSchema = createPlayerFormSchema.extend({
  id: cuid,
  status: z.nativeEnum(PlayerStatus),
});

export const addNickSchema = z.object({
  nick: z.string().min(1).max(120).trim(),
  network: zodPokerNetwork,
});

export const updateNickSchema = addNickSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const playerIdFieldSchema = cuid;
export const targetIdSchema = cuid;
