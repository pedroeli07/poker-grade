"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseLobbyzeFilters } from "@/lib/grade-matcher";
import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import { requireSession } from "@/lib/auth/session";
import {
  assertCanManageGrades,
  canEditGradeCoachNote,
} from "@/lib/auth/rbac";
import {
  deleteGradeSchema,
  importGradeFormSchema,
  updateGradeCoachNoteSchema,
} from "@/lib/validation/schemas";
import { sanitizeOptional, sanitizeText } from "@/lib/sanitize";
import { notifyGradeCreated } from "@/lib/notifications";

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

export async function importGradeFromJson(formData: FormData) {
  const session = await requireSession();
  assertCanManageGrades(session);

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
    throw err;
  }
}

export async function createGradeProfile(formData: FormData) {
  const session = await requireSession();
  assertCanManageGrades(session);

  const name = sanitizeText(String(formData.get("name") ?? ""), 200);
  const description = sanitizeOptional(
    formData.get("description") ? String(formData.get("description")) : null,
    2000
  );

  if (!name || name.length < 2) {
    throw new Error("Nome deve ter pelo menos 2 caracteres");
  }

  log.info("Criando grade manualmente", { name });

  const grade = await prisma.gradeProfile.create({
    data: { name, description, isTemplate: false },
  });

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

export async function deleteGrade(id: string) {
  const session = await requireSession();
  assertCanManageGrades(session);

  const parsed = deleteGradeSchema.safeParse({ id });
  if (!parsed.success) {
    throw new Error("ID inválido");
  }

  log.info("Excluindo grade", { id: parsed.data.id });
  await prisma.gradeProfile.delete({ where: { id: parsed.data.id } });
  revalidatePath("/dashboard/grades");
  log.success("Grade excluída", { id: parsed.data.id });
}
