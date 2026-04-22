"use server";

import { Prisma } from "@prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { assertCanManageGrades } from "@/lib/utils/auth-permissions";
import { sanitizeText, sanitizeOptional } from "@/lib/utils/text-sanitize";
import { importGradeFormSchema, createGradeRuleSchema } from "@/lib/schemas/grade";
import { limitGradesMutation } from "@/lib/rate-limit";
import { notifyGradeCreated } from "@/lib/queries/db/notification/notify-grades";
import { parseLobbyzeFilters } from "@/lib/grade-matcher";
import { toPrismaJson } from "@/lib/utils/parse-forms";
import { fail } from "@/lib/constants/query-result";
import { ErrorTypes, Err } from "@/lib/types/primitives";
import { importRuleCreateInput } from "./prisma-rule-data";
import { adminMutation } from "./mutation-guard";
import { gradesQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidateGrades } from "@/lib/constants/revalidate-app";

function parseJsonArray(raw: string): Record<string, unknown>[] {
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) throw new Error();
    return v;
  } catch {
    throw new Error(ErrorTypes.INVALID_JSON);
  }
}

export async function importGradeFromJson(formData: FormData) {
  const parsed = importGradeFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    jsonContent: formData.get("jsonContent"),
  });
  if (!parsed.success) throw new Error("Nome e JSON são obrigatórios ou excedem limites");

  const rows = parseJsonArray(parsed.data.jsonContent);
  const name = sanitizeText(parsed.data.name, 200);
  const description = sanitizeOptional(parsed.data.description ?? null, 2000);
  const gradeRules = parseLobbyzeFilters(rows);

  return adminMutation(async () => {
    const grade = await prisma.gradeProfile.create({
      data: {
        name,
        description,
        rawFiltersJson: rows as Prisma.InputJsonValue,
        isTemplate: false,
        rules: {
          create: gradeRules.map((r, i) => importRuleCreateInput(r, rows[i] as Record<string, unknown> | undefined)),
        },
      },
    });
    void notifyGradeCreated(name, grade.id);
    gradesQueriesLog.success("Grade importada via JSON", { name, rules: gradeRules.length });
  });
}

export async function createGradeProfile(formData: FormData): Promise<{ ok: true; id: string } | Err> {
  const name = sanitizeText(String(formData.get("name") ?? ""), 200);
  const description = sanitizeOptional(
    formData.get("description") ? String(formData.get("description")) : null,
    2000
  );
  if (!name || name.length < 2) return fail("Nome deve ter pelo menos 2 caracteres");

  const session = await requireSession();
  assertCanManageGrades(session);
  const rl = await limitGradesMutation(session.userId);
  if (!rl.ok) return fail(`Muitas alterações. Aguarde ${rl.retryAfterSec}s.`);

  let gradeId: string;
  try {
    const grade = await prisma.gradeProfile.create({ data: { name, description, isTemplate: false } });
    gradeId = grade.id;
    gradesQueriesLog.success("Grade criada", { name, id: grade.id });
  } catch (e) {
    if (isRedirectError(e)) throw e;
    gradesQueriesLog.error("Falha ao criar grade", e instanceof Error ? e : undefined);
    return fail(e instanceof Error ? e.message : "Operação falhou.");
  }

  notifyGradeCreated(name, gradeId).catch((e) =>
    gradesQueriesLog.error("notifyGradeCreated falhou (ignorado)", e instanceof Error ? e : undefined)
  );
  try {
    revalidateGrades();
  } catch { /* noop */ }
  return { ok: true, id: gradeId };
}

export async function createGradeRule(gradeProfileId: string): Promise<{ ok: true; id: string } | Err> {
  const parsed = createGradeRuleSchema.safeParse({ gradeProfileId });
  if (!parsed.success) return fail(ErrorTypes.INVALID_DATA);

  const session = await requireSession();
  assertCanManageGrades(session);
  const rl = await limitGradesMutation(session.userId);
  if (!rl.ok) return fail(`Muitas alterações. Aguarde ${rl.retryAfterSec}s e tente novamente.`);

  try {
    const ok = await prisma.gradeProfile.findUnique({ where: { id: parsed.data.gradeProfileId }, select: { id: true } });
    if (!ok) return fail(ErrorTypes.NOT_FOUND);

    const rule = await prisma.gradeRule.create({
      data: { gradeProfileId: parsed.data.gradeProfileId, filterName: "Nova regra", sites: toPrismaJson([]) },
      select: { id: true },
    });
    gradesQueriesLog.success("Regra de grade criada", { ruleId: rule.id, gradeProfileId: parsed.data.gradeProfileId });
    revalidateGrades(`/admin/grades/perfis/${parsed.data.gradeProfileId}`);
    return { ok: true, id: rule.id };
  } catch (e) {
    gradesQueriesLog.error("Falha ao criar regra", e instanceof Error ? e : undefined);
    return fail(e instanceof Error ? e.message : ErrorTypes.OPERATION_FAILED);
  }
}
