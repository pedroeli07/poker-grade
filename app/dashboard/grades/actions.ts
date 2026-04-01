"use server";

import type { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseLobbyzeFilters } from "@/lib/grade-matcher";
import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import { requireSession } from "@/lib/auth/session";
import {
  assertCanManageGrades,
  canEditGradeCoachNote,
  canManageGrades,
} from "@/lib/auth/rbac";
import {
  deleteGradeRuleSchema,
  deleteGradeSchema,
  gradeIdParamSchema,
  importGradeFormSchema,
  updateGradeCoachNoteSchema,
  updateGradeProfileSchema,
  updateGradeRuleSchema,
} from "@/lib/validation/schemas";
import { sanitizeOptional, sanitizeText } from "@/lib/sanitize";
import { notifyGradeCreated } from "@/lib/notifications";
import { getGradesListRowsForSession } from "@/lib/data/grades-list";
import { getGradeByIdForSession } from "@/lib/data/queries";
import { mapPrismaRuleToCard } from "@/lib/grades/map-prisma-rule-to-card";
import { limitGradesMutation, limitGradesRead } from "@/lib/rate-limit";
import type { GradeListRow } from "@/lib/types";
import type { GradeDetailQueryData } from "@/lib/types/grades-detail";

const log = createLogger("grades.actions");

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function toPrismaJsonOptional(
  value: unknown | null | undefined
): Prisma.InputJsonValue | undefined {
  if (value == null) return undefined;
  return value as Prisma.InputJsonValue;
}

async function gradesMutationRateOrError(session: {
  userId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = await limitGradesMutation(session.userId);
  if (!r.ok) {
    return {
      ok: false,
      error: `Muitas alterações. Aguarde ${r.retryAfterSec}s e tente novamente.`,
    };
  }
  return { ok: true };
}

export async function getGradesListRowsAction(): Promise<
  { ok: true; rows: GradeListRow[] } | { ok: false; error: string }
> {
  const session = await requireSession();
  const rl = await limitGradesRead(session.userId);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Aguarde ${rl.retryAfterSec}s e atualize a página.`,
    };
  }
  try {
    const rows = await getGradesListRowsForSession(session);
    return { ok: true, rows };
  } catch (e) {
    log.error(
      "getGradesListRowsAction falhou",
      e instanceof Error ? e : undefined
    );
    return { ok: false, error: "Não foi possível carregar as grades." };
  }
}

export async function getGradeDetailQueryAction(
  gradeId: string
): Promise<
  | { ok: true; data: GradeDetailQueryData }
  | { ok: false; error: string }
> {
  const session = await requireSession();
  const rl = await limitGradesRead(session.userId);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Aguarde ${rl.retryAfterSec}s e tente novamente.`,
    };
  }
  const parsed = gradeIdParamSchema.safeParse({ id: gradeId });
  if (!parsed.success) {
    return { ok: false, error: "Grade inválida." };
  }
  try {
    const grade = await getGradeByIdForSession(session, parsed.data.id);
    if (!grade) {
      return { ok: false, error: "Grade não encontrada." };
    }
    const data: GradeDetailQueryData = {
      id: grade.id,
      name: grade.name,
      description: grade.description,
      assignmentsCount: grade._count.assignments,
      manageRules: canManageGrades(session),
      canEditNote: canEditGradeCoachNote(session),
      rules: grade.rules.map(mapPrismaRuleToCard),
    };
    return { ok: true, data };
  } catch (e) {
    log.error(
      "getGradeDetailQueryAction falhou",
      e instanceof Error ? e : undefined,
      { gradeId }
    );
    return { ok: false, error: "Não foi possível carregar a grade." };
  }
}

export async function importGradeFromJson(formData: FormData) {
  const session = await requireSession();
  assertCanManageGrades(session);
  const gate = await gradesMutationRateOrError(session);
  if (!gate.ok) throw new Error(gate.error);

  const parsedForm = importGradeFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    jsonContent: formData.get("jsonContent"),
  });

  if (!parsedForm.success) {
    log.warn("Import grade: validação Zod falhou");
    throw new Error("Nome e JSON são obrigatórios ou excedem limites");
  }

  const name = sanitizeText(parsedForm.data.name, 200);
  const description = sanitizeOptional(
    parsedForm.data.description ?? null,
    2000
  );
  const jsonString = parsedForm.data.jsonContent;

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonString);
    if (!Array.isArray(parsedJson)) {
      throw new Error("JSON deve ser um array de filtros da Lobbyze");
    }
  } catch (e) {
    log.error(
      "JSON inválido na importação de grade",
      e instanceof Error ? e : undefined,
      { name }
    );
    throw new Error("Formato JSON inválido");
  }

  log.info("Importando grade a partir do JSON", {
    name,
    filterCount: parsedJson.length,
  });

  const gradeRules = parseLobbyzeFilters(
    parsedJson as Record<string, unknown>[]
  );

  try {
    const grade = await prisma.gradeProfile.create({
      data: {
        name,
        description,
        rawFiltersJson: parsedJson as Prisma.InputJsonValue,
        isTemplate: false,
        rules: {
          create: gradeRules.map((r, i) => {
            const row = (parsedJson as Record<string, unknown>[])[i];
            const lid = row?.id;
            return {
              filterName: sanitizeText(r.filterName, 500),
              lobbyzeFilterId: typeof lid === "number" ? lid : null,
              sites: toPrismaJson(r.sites),
              buyInMin: r.buyInMin,
              buyInMax: r.buyInMax,
              speed: toPrismaJsonOptional(r.speed),
              variant: toPrismaJsonOptional(r.variant),
              tournamentType: toPrismaJsonOptional(r.tournamentType),
              prizePoolMin: r.prizePoolMin,
              prizePoolMax: r.prizePoolMax,
              minParticipants: r.minParticipants,
              excludePattern: sanitizeOptional(r.excludePattern, 2000),
              fromTime: r.fromTime,
              toTime: r.toTime,
              weekDay: toPrismaJsonOptional(r.weekDay),
            };
          }),
        },
      },
    });

    void notifyGradeCreated(name, grade.id);
    revalidatePath("/dashboard/grades");
    log.success("Grade importada via JSON", { name, rules: gradeRules.length });
    return { success: true };
  } catch (err) {
    log.error(
      "Falha ao persistir grade",
      err instanceof Error ? err : undefined,
      { name }
    );
    throw new Error("Não foi possível salvar a grade importada.");
  }
}

export async function createGradeProfile(formData: FormData) {
  const session = await requireSession();
  assertCanManageGrades(session);
  const gate = await gradesMutationRateOrError(session);
  if (!gate.ok) throw new Error(gate.error);

  const name = sanitizeText(String(formData.get("name") ?? ""), 200);
  const description = sanitizeOptional(
    formData.get("description") ? String(formData.get("description")) : null,
    2000
  );

  if (!name || name.length < 2) {
    throw new Error("Nome deve ter pelo menos 2 caracteres");
  }

  log.info("Criando grade manualmente", { name });

  let grade;
  try {
    grade = await prisma.gradeProfile.create({
      data: { name, description, isTemplate: false },
    });
  } catch (e) {
    log.error(
      "createGradeProfile persistência",
      e instanceof Error ? e : undefined,
      { name }
    );
    throw new Error("Não foi possível criar a grade.");
  }

  void notifyGradeCreated(name, grade.id);
  revalidatePath("/dashboard/grades");
  log.success("Grade criada manualmente", { name, id: grade.id });
  return { success: true, id: grade.id };
}

export async function updateGradeCoachNote(
  gradeId: string,
  description: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  if (!canEditGradeCoachNote(session)) {
    return { ok: false, error: "Sem permissão para editar esta nota." };
  }
  const gate = await gradesMutationRateOrError(session);
  if (!gate.ok) return { ok: false, error: gate.error };

  const parsed = updateGradeCoachNoteSchema.safeParse({
    gradeId,
    description: description ?? null,
  });
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos." };
  }

  const exists = await prisma.gradeProfile.findUnique({
    where: { id: parsed.data.gradeId },
    select: { id: true },
  });
  if (!exists) {
    return { ok: false, error: "Grade não encontrada." };
  }

  const cleaned = sanitizeOptional(
    parsed.data.description != null && parsed.data.description !== ""
      ? parsed.data.description
      : null,
    2000
  );

  await prisma.gradeProfile.update({
    where: { id: parsed.data.gradeId },
    data: { description: cleaned },
  });

  revalidatePath(`/dashboard/grades/${parsed.data.gradeId}`);
  revalidatePath("/dashboard/grades");
  revalidatePath("/dashboard/minha-grade");
  log.info("Nota do coach atualizada", { gradeId: parsed.data.gradeId });
  return { ok: true };
}

export async function deleteGrade(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  assertCanManageGrades(session);
  const gate = await gradesMutationRateOrError(session);
  if (!gate.ok) return { ok: false, error: gate.error };

  const parsed = deleteGradeSchema.safeParse({ id });
  if (!parsed.success) {
    return { ok: false, error: "Solicitação inválida." };
  }

  log.info("Excluindo grade", { id: parsed.data.id });
  try {
    await prisma.gradeProfile.delete({ where: { id: parsed.data.id } });
  } catch (e) {
    log.error(
      "deleteGrade persistência",
      e instanceof Error ? e : undefined,
      { id: parsed.data.id }
    );
    return { ok: false, error: "Não foi possível excluir a grade." };
  }
  revalidatePath("/dashboard/grades");
  log.success("Grade excluída", { id: parsed.data.id });
  return { ok: true };
}

export async function updateGradeProfile(
  gradeId: string,
  name: string,
  description: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  assertCanManageGrades(session);
  const gate = await gradesMutationRateOrError(session);
  if (!gate.ok) return { ok: false, error: gate.error };

  const parsed = updateGradeProfileSchema.safeParse({
    gradeId,
    name,
    description: description ?? null,
  });
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos." };
  }

  const exists = await prisma.gradeProfile.findUnique({
    where: { id: parsed.data.gradeId },
    select: { id: true },
  });
  if (!exists) {
    return { ok: false, error: "Grade não encontrada." };
  }

  const cleanedName = sanitizeText(parsed.data.name, 200);
  const cleanedDesc = sanitizeOptional(
    parsed.data.description != null && parsed.data.description !== ""
      ? parsed.data.description
      : null,
    2000
  );

  await prisma.gradeProfile.update({
    where: { id: parsed.data.gradeId },
    data: { name: cleanedName, description: cleanedDesc },
  });

  revalidatePath("/dashboard/grades");
  revalidatePath(`/dashboard/grades/${parsed.data.gradeId}`);
  revalidatePath("/dashboard/minha-grade");
  log.info("Grade atualizada", { gradeId: parsed.data.gradeId });
  return { ok: true };
}

function sanitizeLobbyzeItems(
  items: { item_id: number | string; item_text: string }[]
) {
  return items.map((s) => ({
    item_id: s.item_id,
    item_text: sanitizeText(s.item_text, 200),
  }));
}

export type UpdateGradeRuleInput = Omit<
  z.infer<typeof updateGradeRuleSchema>,
  "ruleId"
>;

export async function updateGradeRule(
  ruleId: string,
  payload: UpdateGradeRuleInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  assertCanManageGrades(session);
  const gate = await gradesMutationRateOrError(session);
  if (!gate.ok) return { ok: false, error: gate.error };

  const parsed = updateGradeRuleSchema.safeParse({
    ruleId,
    filterName: payload.filterName,
    sites: sanitizeLobbyzeItems(payload.sites),
    buyInMin: payload.buyInMin,
    buyInMax: payload.buyInMax,
    speed: sanitizeLobbyzeItems(payload.speed),
    tournamentType: sanitizeLobbyzeItems(payload.tournamentType),
    variant: sanitizeLobbyzeItems(payload.variant),
    gameType: sanitizeLobbyzeItems(payload.gameType),
    playerCount: sanitizeLobbyzeItems(payload.playerCount),
    weekDay: sanitizeLobbyzeItems(payload.weekDay),
    prizePoolMin: payload.prizePoolMin,
    prizePoolMax: payload.prizePoolMax,
    minParticipants: payload.minParticipants,
    fromTime: payload.fromTime,
    toTime: payload.toTime,
    excludePattern: payload.excludePattern,
    timezone: payload.timezone,
    autoOnly: payload.autoOnly,
    manualOnly: payload.manualOnly,
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message;
    return { ok: false, error: msg ?? "Dados inválidos." };
  }

  const rule = await prisma.gradeRule.findUnique({
    where: { id: parsed.data.ruleId },
    select: { id: true, gradeProfileId: true },
  });
  if (!rule) {
    return { ok: false, error: "Regra não encontrada." };
  }

  const cleanedName = sanitizeText(parsed.data.filterName, 500);
  const cleanedExclude = sanitizeOptional(
    parsed.data.excludePattern ?? null,
    2000
  );

  await prisma.gradeRule.update({
    where: { id: parsed.data.ruleId },
    data: {
      filterName: cleanedName,
      sites: toPrismaJson(parsed.data.sites),
      buyInMin: parsed.data.buyInMin,
      buyInMax: parsed.data.buyInMax,
      speed: toPrismaJsonOptional(parsed.data.speed),
      tournamentType: toPrismaJsonOptional(parsed.data.tournamentType),
      variant: toPrismaJsonOptional(parsed.data.variant),
      gameType: toPrismaJsonOptional(parsed.data.gameType),
      playerCount: toPrismaJsonOptional(parsed.data.playerCount),
      weekDay: toPrismaJsonOptional(parsed.data.weekDay),
      prizePoolMin: parsed.data.prizePoolMin,
      prizePoolMax: parsed.data.prizePoolMax,
      minParticipants: parsed.data.minParticipants,
      fromTime: parsed.data.fromTime,
      toTime: parsed.data.toTime,
      excludePattern: cleanedExclude,
      timezone: parsed.data.timezone,
      autoOnly: parsed.data.autoOnly,
      manualOnly: parsed.data.manualOnly,
    },
  });

  revalidatePath("/dashboard/grades");
  revalidatePath(`/dashboard/grades/${rule.gradeProfileId}`);
  log.info("Regra de grade atualizada", { ruleId: parsed.data.ruleId });
  return { ok: true };
}

export async function deleteGradeRule(
  ruleId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  assertCanManageGrades(session);
  const gate = await gradesMutationRateOrError(session);
  if (!gate.ok) return { ok: false, error: gate.error };

  const parsed = deleteGradeRuleSchema.safeParse({ ruleId });
  if (!parsed.success) {
    return { ok: false, error: "ID inválido." };
  }

  const rule = await prisma.gradeRule.findUnique({
    where: { id: parsed.data.ruleId },
    select: { id: true, gradeProfileId: true },
  });
  if (!rule) {
    return { ok: false, error: "Regra não encontrada." };
  }

  await prisma.gradeRule.delete({ where: { id: parsed.data.ruleId } });

  revalidatePath("/dashboard/grades");
  revalidatePath(`/dashboard/grades/${rule.gradeProfileId}`);
  log.info("Regra de grade excluída", { ruleId: parsed.data.ruleId });
  return { ok: true };
}
