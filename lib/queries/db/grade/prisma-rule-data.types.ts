import type { z } from "zod";
import type { GradeRuleData } from "@/lib/types/grade/index";
import { updateGradeRuleSchema } from "@/lib/schemas/grade";

export type LobbyzeImportRow = Record<string, unknown> | undefined;

export type UnpersistedGradeRule = Omit<GradeRuleData, "id">;

export type UpdateGradeRuleParsed = z.infer<typeof updateGradeRuleSchema>;
