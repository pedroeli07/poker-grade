"use server";

import { prisma } from "@/lib/prisma";
import { sanitizeText, sanitizeOptional } from "@/lib/utils/text-sanitize";
import { sanitizeUserHtml } from "@/lib/utils/sanitize-user-html";
import {
  updateGradeCoachNoteSchema,
  updateGradeProfileSchema,
  updateGradeRuleSchema,
} from "@/lib/schemas/grade";
import { canEditGradeCoachNote } from "@/lib/utils/auth-permissions";
import { fail } from "@/lib/constants/query-result";
import { ErrorTypes, Err, Ok } from "@/lib/types/primitives";
import { UpdateGradeRuleInput } from "@/lib/types/grade/index";
import { gradesQueriesLog } from "@/lib/constants/queries-mutations";
import { prismaDataFromUpdateRule, toUpdateRuleSchemaInput } from "./prisma-rule-data";
import { adminMutation, withMutation } from "./mutation-guard";

export async function updateGradeCoachNote(gradeId: string, description: string | null): Promise<Ok | Err> {
  const parsed = updateGradeCoachNoteSchema.safeParse({ gradeId, description: description ?? null });
  if (!parsed.success) return fail(ErrorTypes.INVALID_DATA);

  return withMutation(
    (s) => {
      if (!canEditGradeCoachNote(s)) throw new Error(ErrorTypes.FORBIDDEN);
    },
    async () => {
      const exists = await prisma.gradeProfile.findUnique({
        where: { id: parsed.data.gradeId },
        select: { id: true },
      });
      if (!exists) throw new Error(ErrorTypes.NOT_FOUND);
      const rawHtml = parsed.data.description || null;
      const sanitized = rawHtml ? sanitizeUserHtml(rawHtml) : null;
      await prisma.gradeProfile.update({
        where: { id: parsed.data.gradeId },
        data: { description: sanitized || null },
      });
      gradesQueriesLog.info("Nota do coach atualizada", { gradeId: parsed.data.gradeId });
      return [`/admin/grades/perfis/${parsed.data.gradeId}`];
    }
  );
}

export async function updateGradeProfile(gradeId: string, name: string, description: string | null): Promise<Ok | Err> {
  const parsed = updateGradeProfileSchema.safeParse({ gradeId, name, description: description ?? null });
  if (!parsed.success) return fail(ErrorTypes.INVALID_DATA);

  return adminMutation(async () => {
    const exists = await prisma.gradeProfile.findUnique({ where: { id: parsed.data.gradeId }, select: { id: true } });
    if (!exists) throw new Error(ErrorTypes.NOT_FOUND);
    await prisma.gradeProfile.update({
      where: { id: parsed.data.gradeId },
      data: {
        name: sanitizeText(parsed.data.name, 200),
        description: sanitizeOptional(parsed.data.description || null, 2000),
      },
    });
    gradesQueriesLog.info("Grade atualizada", { gradeId: parsed.data.gradeId });
    return [`/admin/grades/perfis/${parsed.data.gradeId}`];
  });
}

export async function updateGradeRule(ruleId: string, payload: UpdateGradeRuleInput): Promise<Ok | Err> {
  const parsed = updateGradeRuleSchema.safeParse(toUpdateRuleSchemaInput(ruleId, payload));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? ErrorTypes.INVALID_DATA);

  return adminMutation(async () => {
    const rule = await prisma.gradeRule.findUnique({
      where: { id: parsed.data.ruleId },
      select: { id: true, gradeProfileId: true },
    });
    if (!rule) throw new Error(ErrorTypes.NOT_FOUND);
    await prisma.gradeRule.update({
      where: { id: parsed.data.ruleId },
      data: prismaDataFromUpdateRule(parsed.data),
    });
    gradesQueriesLog.info("Regra de grade atualizada", { ruleId: parsed.data.ruleId });
    return [`/admin/grades/perfis/${rule.gradeProfileId}`];
  });
}
