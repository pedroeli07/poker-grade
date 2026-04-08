"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import { requireSession } from "@/lib/auth/session";
import { assertCanWrite } from "@/lib/auth/rbac";
import { sanitizeText, sanitizeOptional } from "@/lib/sanitize";
import type { TargetType, LimitAction } from "@prisma/client";
import { limitDashboardMutation, limitDashboardRead } from "@/lib/rate-limit";
import { getTargetsListRowsForSession } from "@/lib/data/targets-list";
import { assertTargetWritableBySession } from "@/lib/data/queries";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

const log = createLogger("targets.actions");

const playerIdFieldSchema = z.cuid();

export async function getTargetsListDataAction() {
  const session = await requireSession();
  const rl = await limitDashboardRead(session.userId);
  if (!rl.ok) {
    return {
      ok: false as const,
      error: `Muitas consultas. Aguarde ${rl.retryAfterSec}s.`,
    };
  }
  const rows = await getTargetsListRowsForSession(session);
  return { ok: true as const, rows };
}

export async function createTarget(formData: FormData) {
  const session = await requireSession();
  assertCanWrite(session);
  const gate = await limitDashboardMutation(session.userId);
  if (!gate.ok) {
    throw new Error(`Aguarde ${gate.retryAfterSec}s.`);
  }

  const playerIdRaw = String(formData.get("playerId") ?? "");
  const playerParsed = playerIdFieldSchema.safeParse(playerIdRaw);
  if (!playerParsed.success) {
    throw new Error("Dados inválidos");
  }
  const playerId = playerParsed.data;

  const name = sanitizeText(String(formData.get("name") ?? ""), 200);
  const category = sanitizeText(String(formData.get("category") ?? "performance"), 100);
  const targetType = (formData.get("targetType") ?? "NUMERIC") as TargetType;
  const unit = sanitizeOptional(String(formData.get("unit") ?? ""), 30);
  const numericValue = formData.get("numericValue") ? Number(formData.get("numericValue")) : null;
  const numericCurrent = formData.get("numericCurrent") ? Number(formData.get("numericCurrent")) : null;
  const greenThreshold = formData.get("greenThreshold") ? Number(formData.get("greenThreshold")) : null;
  const yellowThreshold = formData.get("yellowThreshold") ? Number(formData.get("yellowThreshold")) : null;
  const textValue = sanitizeOptional(String(formData.get("textValue") ?? ""), 1000);
  const coachNotes = sanitizeOptional(String(formData.get("coachNotes") ?? ""), 2000);
  const limitActionRaw = formData.get("limitAction");
  const limitAction = limitActionRaw && limitActionRaw !== "none" ? (limitActionRaw as LimitAction) : null;

  if (!name || name.length < 2) {
    throw new Error("Dados inválidos");
  }

  if (session.role === "COACH" && session.coachId) {
    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        OR: [{ coachId: session.coachId }, { driId: session.coachId }],
      },
    });
    if (!player) throw new Error("FORBIDDEN");
  }

  log.info("Criando target", { playerId, name, targetType });

  try {
    await prisma.playerTarget.create({
      data: {
        playerId,
        name,
        category,
        targetType,
        unit: unit || null,
        numericValue,
        numericCurrent,
        greenThreshold,
        yellowThreshold,
        textValue: textValue || null,
        coachNotes: coachNotes || null,
        limitAction,
        status: "ATTENTION",
      },
    });
  } catch (e) {
    if (isRedirectError(e)) throw e;
    log.error("createTarget falhou", e instanceof Error ? e : undefined, { playerId });
    throw new Error("Não foi possível criar o target.");
  }

  revalidatePath("/dashboard/targets");
  log.success("Target criado", { name });
  return { success: true };
}

const targetIdSchema = z.cuid();

export async function deleteTarget(id: string) {
  const session = await requireSession();
  assertCanWrite(session);
  const gate = await limitDashboardMutation(session.userId);
  if (!gate.ok) {
    throw new Error(`Aguarde ${gate.retryAfterSec}s.`);
  }

  const parsed = targetIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Dados inválidos");
  }

  await assertTargetWritableBySession(session, parsed.data);

  log.info("Excluindo target", { id: parsed.data });
  try {
    await prisma.playerTarget.delete({ where: { id: parsed.data } });
  } catch (e) {
    if (isRedirectError(e)) throw e;
    log.error("deleteTarget falhou", e instanceof Error ? e : undefined, { id: parsed.data });
    throw new Error("Não foi possível excluir o target.");
  }
  revalidatePath("/dashboard/targets");
  log.success("Target excluído", { id: parsed.data });
}
