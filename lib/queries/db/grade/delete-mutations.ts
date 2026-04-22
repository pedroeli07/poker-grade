"use server";

import { prisma } from "@/lib/prisma";
import { deleteGradeSchema, deleteGradeRuleSchema } from "@/lib/schemas/grade";
import { fail } from "@/lib/constants/query-result";
import { Err, Ok } from "@/lib/types/primitives";
import { gradesQueriesLog } from "@/lib/constants/queries-mutations";
import { adminMutation } from "./mutation-guard";

export async function deleteGrade(id: string): Promise<Ok | Err> {
  const parsed = deleteGradeSchema.safeParse({ id });
  if (!parsed.success) return fail("Solicitação inválida.");

  return adminMutation(async () => {
    await prisma.gradeProfile.delete({ where: { id: parsed.data.id } });
    gradesQueriesLog.success("Grade excluída", { id: parsed.data.id });
  });
}

export async function deleteGradeRule(ruleId: string): Promise<Ok | Err> {
  const parsed = deleteGradeRuleSchema.safeParse({ ruleId });
  if (!parsed.success) return fail("ID inválido.");

  return adminMutation(async () => {
    const rule = await prisma.gradeRule.findUnique({
      where: { id: parsed.data.ruleId },
      select: { id: true, gradeProfileId: true },
    });
    if (!rule) throw new Error("Regra não encontrada.");
    await prisma.gradeRule.delete({ where: { id: parsed.data.ruleId } });
    gradesQueriesLog.info("Regra de grade excluída", { ruleId: parsed.data.ruleId });
    return [`/admin/grades/perfis/${rule.gradeProfileId}`];
  });
}
