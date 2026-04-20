"use server";

import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { assertCanManageGrades, canEditGradeCoachNote, canManageGrades, sanitizeOptional, sanitizeText, sanitizeUserHtml } from "@/lib/utils";
import {
  createGradeRuleSchema, deleteGradeRuleSchema, deleteGradeSchema, gradeIdParamSchema,
  importGradeFormSchema, updateGradeCoachNoteSchema, updateGradeProfileSchema, updateGradeRuleSchema,
} from "@/lib/schemas";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { notifyGradeCreated } from "@/lib/queries/db/notification";
import { getGradesListRowsForSession } from "@/lib/data/grades";
import { limitGradesMutation } from "@/lib/rate-limit";
import { gradesQueryRead } from "@/lib/queries/db/query-pipeline";
import { parseLobbyzeFilters } from "@/lib/grade-matcher";
import { mapPrismaRuleToCard, toPrismaJson, toPrismaJsonOptional } from "@/lib/utils";
import { Err, GradeListRow, GradeDetailQueryData, UpdateGradeRuleInput, Ok, ErrorTypes, AppSession } from "@/lib/types";
import { fail, sanitizeLobbyzeItems } from "@/lib/constants";
import { gradesQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidateGrades } from "@/lib/constants/revalidate-app";

// ─── Pipeline guards ──────────────────────────────────────────────────────────

async function withMutation(
  guard: (s: AppSession) => void,
  fn: (s: AppSession) => Promise<string[] | void>
): Promise<Ok | Err> {
  const session = await requireSession();
  guard(session);
  const rl = await limitGradesMutation(session.userId);
  if (!rl.ok) return fail(`Muitas alterações. Aguarde ${rl.retryAfterSec}s e tente novamente.`);
  try {
    const extra = await fn(session);
    revalidateGrades(...(extra ?? []));
    return { ok: true };
  } catch (e) {
    return fail(e instanceof Error ? e.message : ErrorTypes.OPERATION_FAILED);
  }
}

const adminMutation = (fn: (s: AppSession) => Promise<string[] | void>) =>
  withMutation(assertCanManageGrades, fn);

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getGradesForSession(session: AppSession) {
  const include = { _count: { select: { rules: true, assignments: true } } };
  if (session.role !== UserRole.PLAYER)
    return prisma.gradeProfile.findMany({ include, orderBy: { createdAt: "desc" } });

  if (!session.playerId) return [];
  const ids = await prisma.playerGradeAssignment
    .findMany({ where: { playerId: session.playerId, isActive: true }, select: { gradeId: true } })
    .then(a => a.map(x => x.gradeId));

  return ids.length
    ? prisma.gradeProfile.findMany({ where: { id: { in: ids } }, include, orderBy: { createdAt: "desc" } })
    : [];
}

/**
 * Lightweight version for dropdowns/selects — only fetches id + name, no counts.
 * Use this instead of getGradesForSession when you don't need rulesCount/assignmentsCount.
 */
export async function getGradeIdsAndNamesForSession(session: AppSession) {
  const select = { id: true, name: true } as const;
  if (session.role !== UserRole.PLAYER)
    return prisma.gradeProfile.findMany({ select, orderBy: { createdAt: "desc" } });

  if (!session.playerId) return [];
  const ids = await prisma.playerGradeAssignment
    .findMany({ where: { playerId: session.playerId, isActive: true }, select: { gradeId: true } })
    .then(a => a.map(x => x.gradeId));

  return ids.length
    ? prisma.gradeProfile.findMany({ where: { id: { in: ids } }, select, orderBy: { createdAt: "desc" } })
    : [];
}

export async function getGradeByIdForSession(session: AppSession, id: string) {
  const grade = await prisma.gradeProfile.findUnique({
    where: { id },
    include: { rules: true, _count: { select: { assignments: true } } },
  });
  if (!grade || session.role !== UserRole.PLAYER || !session.playerId) return grade;

  const assigned = await prisma.playerGradeAssignment.findFirst({
    where: { playerId: session.playerId, gradeId: id, isActive: true },
  });
  return assigned ? grade : null;
}

export async function getGradesListRowsAction(): Promise<{ ok: true; rows: GradeListRow[] } | Err> {
  const result = await gradesQueryRead.readData(getGradesListRowsForSession);
  return result.ok ? { ok: true, rows: result.data } : result;
}

export async function getGradeDetailQueryAction(
  gradeId: string
): Promise<{ ok: true; data: GradeDetailQueryData } | Err> {
  const parsed = gradeIdParamSchema.safeParse({ id: gradeId });
  if (!parsed.success) return fail(ErrorTypes.INVALID_DATA);

  const result = await gradesQueryRead.readData(async session => {
    const grade = await getGradeByIdForSession(session, parsed.data.id);
    if (!grade) throw new Error(ErrorTypes.NOT_FOUND);
    return {
      id: grade.id, name: grade.name, description: grade.description,
      assignmentsCount: grade._count.assignments,
      manageRules: canManageGrades(session),
      canEditNote: canEditGradeCoachNote(session),
      rules: grade.rules.map(mapPrismaRuleToCard),
      createdAt: grade.createdAt,
    } satisfies GradeDetailQueryData;
  });

  return result.ok ? { ok: true, data: result.data } : result;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function importGradeFromJson(formData: FormData) {
  const parsed = importGradeFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    jsonContent: formData.get("jsonContent"),
  });
  if (!parsed.success) throw new Error("Nome e JSON são obrigatórios ou excedem limites");

  let parsedJson: Record<string, unknown>[];
  try {
    const raw = JSON.parse(parsed.data.jsonContent);
    if (!Array.isArray(raw)) throw new Error();
    parsedJson = raw;
  } catch { throw new Error(ErrorTypes.INVALID_JSON); }

  const name = sanitizeText(parsed.data.name, 200);
  const description = sanitizeOptional(parsed.data.description ?? null, 2000);
  const gradeRules = parseLobbyzeFilters(parsedJson);

  return adminMutation(async () => {
    const grade = await prisma.gradeProfile.create({
      data: {
        name, description,
        rawFiltersJson: parsedJson as Prisma.InputJsonValue,
        isTemplate: false,
        rules: {
          create: gradeRules.map((r, i) => {
            const lid = parsedJson[i]?.id;
            return {
              filterName: sanitizeText(r.filterName, 500),
              lobbyzeFilterId: typeof lid === "number" ? lid : null,
              sites: toPrismaJson(r.sites),
              buyInMin: r.buyInMin, buyInMax: r.buyInMax,
              speed: toPrismaJsonOptional(r.speed),
              variant: toPrismaJsonOptional(r.variant),
              tournamentType: toPrismaJsonOptional(r.tournamentType),
              prizePoolMin: r.prizePoolMin, prizePoolMax: r.prizePoolMax,
              minParticipants: r.minParticipants,
              excludePattern: sanitizeOptional(r.excludePattern, 2000),
              fromTime: r.fromTime, toTime: r.toTime,
              weekDay: toPrismaJsonOptional(r.weekDay),
            };
          }),
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
    formData.get("description") ? String(formData.get("description")) : null, 2000
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
  try { revalidateGrades(); } catch { /* noop */ }
  return { ok: true, id: gradeId };
}

export async function updateGradeCoachNote(
  gradeId: string, description: string | null
): Promise<Ok | Err> {
  const parsed = updateGradeCoachNoteSchema.safeParse({ gradeId, description: description ?? null });
  if (!parsed.success) return fail(ErrorTypes.INVALID_DATA);

  return withMutation(
    s => { if (!canEditGradeCoachNote(s)) throw new Error(ErrorTypes.FORBIDDEN); },
    async () => {
      const exists = await prisma.gradeProfile.findUnique({ where: { id: parsed.data.gradeId }, select: { id: true } });
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

export async function deleteGrade(id: string): Promise<Ok | Err> {
  const parsed = deleteGradeSchema.safeParse({ id });
  if (!parsed.success) return fail("Solicitação inválida.");

  return adminMutation(async () => {
    await prisma.gradeProfile.delete({ where: { id: parsed.data.id } });
    gradesQueriesLog.success("Grade excluída", { id: parsed.data.id });
  });
}

export async function updateGradeProfile(
  gradeId: string, name: string, description: string | null
): Promise<Ok | Err> {
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

export async function updateGradeRule(
  ruleId: string, payload: UpdateGradeRuleInput
): Promise<Ok | Err> {
  const parsed = updateGradeRuleSchema.safeParse({
    ruleId,
    filterName: payload.filterName,
    sites: sanitizeLobbyzeItems(payload.sites),
    buyInMin: payload.buyInMin, buyInMax: payload.buyInMax,
    speed: sanitizeLobbyzeItems(payload.speed),
    tournamentType: sanitizeLobbyzeItems(payload.tournamentType),
    variant: sanitizeLobbyzeItems(payload.variant),
    gameType: sanitizeLobbyzeItems(payload.gameType),
    playerCount: sanitizeLobbyzeItems(payload.playerCount),
    weekDay: sanitizeLobbyzeItems(payload.weekDay),
    prizePoolMin: payload.prizePoolMin, prizePoolMax: payload.prizePoolMax,
    minParticipants: payload.minParticipants,
    fromTime: payload.fromTime, toTime: payload.toTime,
    excludePattern: payload.excludePattern,
    timezone: payload.timezone,
    autoOnly: payload.autoOnly, manualOnly: payload.manualOnly,
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? ErrorTypes.INVALID_DATA);

  return adminMutation(async () => {
    const rule = await prisma.gradeRule.findUnique({ where: { id: parsed.data.ruleId }, select: { id: true, gradeProfileId: true } });
    if (!rule) throw new Error(ErrorTypes.NOT_FOUND);

    await prisma.gradeRule.update({
      where: { id: parsed.data.ruleId },
      data: {
        filterName: sanitizeText(parsed.data.filterName, 500),
        sites: toPrismaJson(parsed.data.sites),
        buyInMin: parsed.data.buyInMin, buyInMax: parsed.data.buyInMax,
        speed: toPrismaJsonOptional(parsed.data.speed),
        tournamentType: toPrismaJsonOptional(parsed.data.tournamentType),
        variant: toPrismaJsonOptional(parsed.data.variant),
        gameType: toPrismaJsonOptional(parsed.data.gameType),
        playerCount: toPrismaJsonOptional(parsed.data.playerCount),
        weekDay: toPrismaJsonOptional(parsed.data.weekDay),
        prizePoolMin: parsed.data.prizePoolMin, prizePoolMax: parsed.data.prizePoolMax,
        minParticipants: parsed.data.minParticipants,
        fromTime: parsed.data.fromTime, toTime: parsed.data.toTime,
        excludePattern: sanitizeOptional(parsed.data.excludePattern ?? null, 2000),
        timezone: parsed.data.timezone,
        autoOnly: parsed.data.autoOnly, manualOnly: parsed.data.manualOnly,
      },
    });
    gradesQueriesLog.info("Regra de grade atualizada", { ruleId: parsed.data.ruleId });
    return [`/admin/grades/perfis/${rule.gradeProfileId}`];
  });
}

export async function createGradeRule(
  gradeProfileId: string
): Promise<{ ok: true; id: string } | Err> {
  const parsed = createGradeRuleSchema.safeParse({ gradeProfileId });
  if (!parsed.success) return fail(ErrorTypes.INVALID_DATA);

  const session = await requireSession();
  assertCanManageGrades(session);
  const rl = await limitGradesMutation(session.userId);
  if (!rl.ok) return fail(`Muitas alterações. Aguarde ${rl.retryAfterSec}s e tente novamente.`);

  try {
    const grade = await prisma.gradeProfile.findUnique({
      where: { id: parsed.data.gradeProfileId }, select: { id: true },
    });
    if (!grade) return fail(ErrorTypes.NOT_FOUND);

    const rule = await prisma.gradeRule.create({
      data: {
        gradeProfileId: parsed.data.gradeProfileId,
        filterName: "Nova regra",
        sites: toPrismaJson([]),
      },
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

export async function deleteGradeRule(ruleId: string): Promise<Ok | Err> {
  const parsed = deleteGradeRuleSchema.safeParse({ ruleId });
  if (!parsed.success) return fail("ID inválido.");

  return adminMutation(async () => {
    const rule = await prisma.gradeRule.findUnique({ where: { id: parsed.data.ruleId }, select: { id: true, gradeProfileId: true } });
    if (!rule) throw new Error("Regra não encontrada.");
    await prisma.gradeRule.delete({ where: { id: parsed.data.ruleId } });
    gradesQueriesLog.info("Regra de grade excluída", { ruleId: parsed.data.ruleId });
    return [`/admin/grades/perfis/${rule.gradeProfileId}`];
  });
}