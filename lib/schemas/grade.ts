import { z } from "zod";
import { emptyToNullUnknown, zodLobbyzeList, schemaCuid as cuid, zodName, zodDescription, zodRichDescription } from "./primitives";

export const importGradeFormSchema = z.object({
  name: zodName,
  description: zodDescription,
  jsonContent: z.string().min(2).max(5_000_000),
});

export const deleteGradeSchema = z.object({
  id: cuid,
});

export const updateGradeCoachNoteSchema = z.object({
  gradeId: cuid,
  description: zodRichDescription,
});

export const updateGradeProfileSchema = z.object({
  gradeId: cuid,
  name: zodName,
  description: zodDescription,
});

const comparisonRefinement = {
  buyIn: (d: { buyInMin: number | null; buyInMax: number | null }) => {
    if (d.buyInMin != null && d.buyInMax != null) return d.buyInMin <= d.buyInMax;
    return true;
  },
  prizePool: (d: { prizePoolMin: number | null; prizePoolMax: number | null }) => {
    if (d.prizePoolMin != null && d.prizePoolMax != null) return d.prizePoolMin <= d.prizePoolMax;
    return true;
  },
};

export const updateGradeRuleSchema = z
  .object({
    ruleId: cuid,
    filterName: z.string().min(1).max(500),
    sites: zodLobbyzeList.min(1),
    buyInMin: z.number().nonnegative().nullable(),
    buyInMax: z.number().nonnegative().nullable(),
    speed: zodLobbyzeList,
    tournamentType: zodLobbyzeList,
    variant: zodLobbyzeList,
    gameType: zodLobbyzeList,
    playerCount: zodLobbyzeList,
    weekDay: zodLobbyzeList,
    prizePoolMin: z.number().nonnegative().nullable(),
    prizePoolMax: z.number().nonnegative().nullable(),
    minParticipants: z.number().int().nonnegative().nullable(),
    fromTime: z.preprocess(emptyToNullUnknown, z.union([z.string().max(8), z.null()])),
    toTime: z.preprocess(emptyToNullUnknown, z.union([z.string().max(8), z.null()])),
    excludePattern: z.preprocess(emptyToNullUnknown, z.union([z.string().max(2000), z.null()])),
    timezone: z.number().int().min(-840).max(840).nullable(),
    autoOnly: z.boolean(),
    manualOnly: z.boolean(),
  })
  .refine(comparisonRefinement.buyIn, {
    message: "Buy-in mínimo não pode ser maior que o máximo.",
    path: ["buyInMax"],
  })
  .refine(comparisonRefinement.prizePool, {
    message: "Garantido mínimo não pode ser maior que o máximo.",
    path: ["prizePoolMax"],
  });

export const deleteGradeRuleSchema = z.object({
  ruleId: cuid,
});

export const createGradeRuleSchema = z.object({
  gradeProfileId: cuid,
});

export const gradeIdParamSchema = z.object({
  id: cuid,
});
