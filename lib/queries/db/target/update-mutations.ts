"use server";

import { prisma } from "@/lib/prisma";
import type { TargetType, LimitAction } from "@prisma/client";
import { assertCanWrite } from "@/lib/auth/rbac";
import { sanitizeText, sanitizeOptional } from "@/lib/utils/text-sanitize";
import { targetIdSchema } from "@/lib/schemas/player";
import { notifyTargetUpdated } from "@/lib/queries/db/notification/notify-targets";
import { assertTargetWritableBySession } from "./reads";
import { targetMutations, targetsQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidateTargets } from "@/lib/constants/revalidate-app";
import { TargetStatus } from "@prisma/client";
import { ErrorTypes } from "@/lib/types/primitives";

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
          name,
          category,
          targetType,
          unit: unit || null,
          numericValue,
          numericCurrent,
          greenThreshold,
          yellowThreshold,
          textValue: textValue || null,
          textCurrent: textCurrent || null,
          coachNotes: coachNotes || null,
          limitAction,
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
