"use server";

import { prisma } from "@/lib/prisma";
import type { TargetType, LimitAction } from "@prisma/client";
import { assertCanWrite } from "@/lib/auth/rbac";
import { sanitizeText, sanitizeOptional } from "@/lib/utils";
import { dashboardQueryRead } from "@/lib/queries/db/query-pipeline";
import { getTargetsListRowsForSession } from "@/lib/data/targets";
import { deleteTargetIdsSchema, playerIdFieldSchema, targetIdSchema } from "@/lib/schemas";
import { coachPlayerFilter } from "../shared";
import {
  notifyTargetCreated,
  notifyTargetDeleted,
  notifyTargetUpdated,
  notifyTargetsDeletedBatch,
} from "@/lib/queries/db/notification";
import { targetMutations, targetsQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidateTargets } from "@/lib/constants/revalidate-app";
import { TargetStatus, UserRole } from "@prisma/client";
import { ErrorTypes, AppSession } from "@/lib/types";

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getTargetsForSession(session: AppSession) {
  const where =
    session.role === UserRole.COACH && session.coachId ? { player: coachPlayerFilter(session.coachId) } :
    session.role === UserRole.PLAYER && session.playerId ? { playerId: session.playerId } :
    session.role === UserRole.ADMIN || session.role === UserRole.MANAGER || session.role === UserRole.VIEWER ? {} :
    { id: "___none___" };

  return prisma.playerTarget.findMany({ where, include: { player: true }, orderBy: { createdAt: "desc" } });
}

export async function assertTargetWritableBySession(session: AppSession, targetId: string): Promise<void> {
  const t = await prisma.playerTarget.findUnique({ where: { id: targetId }, select: { id: true, playerId: true } });
  if (!t) throw new Error(ErrorTypes.NOT_FOUND);
  if (session.role === UserRole.ADMIN || session.role === UserRole.MANAGER) return;
  if (session.role === UserRole.COACH && session.coachId) {
    const p = await prisma.player.findFirst({ where: { id: t.playerId, ...coachPlayerFilter(session.coachId) }, select: { id: true } });
    if (!p) throw new Error(ErrorTypes.FORBIDDEN);
    return;
  }
  throw new Error(ErrorTypes.FORBIDDEN);
}

export async function getTargetsListDataAction() {
  return dashboardQueryRead.readRows(getTargetsListRowsForSession);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createTarget(formData: FormData) {
  return targetMutations.run(assertCanWrite, async (session) => {
    const playerIdRaw = String(formData.get("playerId") ?? "");
    const playerParsed = playerIdFieldSchema.safeParse(playerIdRaw);
    if (!playerParsed.success) throw new Error(ErrorTypes.INVALID_DATA);
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

    if (!name || name.length < 2) throw new Error(ErrorTypes.INVALID_DATA);

    if (session.role === UserRole.COACH && session.coachId) {
      const player = await prisma.player.findFirst({
        where: { id: playerId, OR: [{ coachId: session.coachId }, { driId: session.coachId }] },
      });
      if (!player) throw new Error(ErrorTypes.FORBIDDEN);
    }

    targetsQueriesLog.info("Criando target", { playerId, name, targetType });

    try {
      await prisma.playerTarget.create({
        data: {
          playerId, name, category, targetType, unit: unit || null,
          numericValue, numericCurrent, greenThreshold, yellowThreshold,
          textValue: textValue || null, coachNotes: coachNotes || null, limitAction, status: TargetStatus.ATTENTION,
        },
      });
    } catch (e) {
      targetsQueriesLog.error("createTarget falhou", e instanceof Error ? e : undefined, { playerId });
      throw new Error(ErrorTypes.OPERATION_FAILED);
    }

    await notifyTargetCreated(playerId, name, {
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
    });

    targetsQueriesLog.success("Target criado", { name });
  }, () => revalidateTargets());
}

export async function updateTarget(formData: FormData) {
  return targetMutations.run(assertCanWrite, async (session) => {
    const idRaw = String(formData.get("id") ?? "");
    const idParsed = targetIdSchema.safeParse(idRaw);
    if (!idParsed.success) throw new Error(ErrorTypes.INVALID_DATA);
    const id = idParsed.data;

    await assertTargetWritableBySession(session, id);

    const name = sanitizeText(String(formData.get("name") ?? ""), 200);
    const category = sanitizeText(String(formData.get("category") ?? "performance"), 100);
    const targetType = (formData.get("targetType") ?? "NUMERIC") as TargetType;
    const unit = sanitizeOptional(String(formData.get("unit") ?? ""), 30);
    const numericValue = formData.get("numericValue") ? Number(formData.get("numericValue")) : null;
    const numericCurrent = formData.get("numericCurrent") ? Number(formData.get("numericCurrent")) : null;
    const greenThreshold = formData.get("greenThreshold") ? Number(formData.get("greenThreshold")) : null;
    const yellowThreshold = formData.get("yellowThreshold") ? Number(formData.get("yellowThreshold")) : null;
    const textValue = sanitizeOptional(String(formData.get("textValue") ?? ""), 1000);
    const textCurrent = sanitizeOptional(String(formData.get("textCurrent") ?? ""), 1000);
    const coachNotes = sanitizeOptional(String(formData.get("coachNotes") ?? ""), 2000);
    const limitActionRaw = formData.get("limitAction");
    const limitAction = limitActionRaw && limitActionRaw !== "none" ? (limitActionRaw as LimitAction) : null;

    if (!name || name.length < 2) throw new Error(ErrorTypes.INVALID_DATA);

    // Recalcula status para numéricos com thresholds definidos
    let status: TargetStatus | undefined;
    if (targetType === "NUMERIC" && numericCurrent != null) {
      if (greenThreshold != null && numericCurrent >= greenThreshold) status = TargetStatus.ON_TRACK;
      else if (yellowThreshold != null && numericCurrent >= yellowThreshold) status = TargetStatus.ATTENTION;
      else if (greenThreshold != null || yellowThreshold != null) status = TargetStatus.OFF_TRACK;
    }

    const existing = await prisma.playerTarget.findUnique({
      where: { id },
      select: { playerId: true, name: true },
    });

    targetsQueriesLog.info("Atualizando target", { id, name });
    try {
      await prisma.playerTarget.update({
        where: { id },
        data: {
          name, category, targetType, unit: unit || null,
          numericValue, numericCurrent, greenThreshold, yellowThreshold,
          textValue: textValue || null, textCurrent: textCurrent || null,
          coachNotes: coachNotes || null, limitAction,
          ...(status !== undefined ? { status } : {}),
        },
      });
    } catch (e) {
      targetsQueriesLog.error("updateTarget falhou", e instanceof Error ? e : undefined, { id });
      throw new Error(ErrorTypes.OPERATION_FAILED);
    }
    if (existing) await notifyTargetUpdated(existing.playerId, name);
    targetsQueriesLog.success("Target atualizado", { id });
  }, () => revalidateTargets());
}

export async function deleteTarget(id: string) {
  return targetMutations.run(assertCanWrite, async (session) => {
    const parsed = targetIdSchema.safeParse(id);
    if (!parsed.success) throw new Error(ErrorTypes.INVALID_DATA);

    await assertTargetWritableBySession(session, parsed.data);

    const existing = await prisma.playerTarget.findUnique({
      where: { id: parsed.data },
      select: { playerId: true, name: true },
    });

    targetsQueriesLog.info("Excluindo target", { id: parsed.data });
    try {
      await prisma.playerTarget.delete({ where: { id: parsed.data } });
    } catch (e) {
      targetsQueriesLog.error("deleteTarget falhou", e instanceof Error ? e : undefined, { id: parsed.data });
      throw new Error(ErrorTypes.OPERATION_FAILED);
    }
    if (existing) await notifyTargetDeleted(existing.playerId, existing.name);
    targetsQueriesLog.success("Target excluído", { id: parsed.data });
  }, () => revalidateTargets());
}

/** Exclui vários targets de uma vez (mesma checagem de permissão que `deleteTarget`). */
export async function deleteTargets(ids: string[]) {
  const parsed = deleteTargetIdsSchema.safeParse([...new Set(ids)]);
  if (!parsed.success) throw new Error(ErrorTypes.INVALID_DATA);
  const unique = parsed.data;

  return targetMutations.run(
    assertCanWrite,
    async (session) => {
      for (const id of unique) {
        await assertTargetWritableBySession(session, id);
      }
      const existingRows = await prisma.playerTarget.findMany({
        where: { id: { in: unique } },
        select: { playerId: true, name: true },
      });
      targetsQueriesLog.info("Excluindo targets em lote", { count: unique.length });
      try {
        await prisma.playerTarget.deleteMany({ where: { id: { in: unique } } });
      } catch (e) {
        targetsQueriesLog.error(
          "deleteTargets falhou",
          e instanceof Error ? e : undefined,
          { count: unique.length }
        );
        throw new Error(ErrorTypes.OPERATION_FAILED);
      }
      await notifyTargetsDeletedBatch(
        existingRows.map((r) => ({ playerId: r.playerId, targetName: r.name })),
      );
      targetsQueriesLog.success("Targets excluídos", { count: unique.length });
    },
    () => revalidateTargets()
  );
}
