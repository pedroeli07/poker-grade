"use server";

import { prisma } from "@/lib/prisma";
import type { TargetType, LimitAction } from "@prisma/client";
import { assertCanWrite } from "@/lib/auth/rbac";
import { sanitizeText, sanitizeOptional } from "@/lib/utils/text-sanitize";
import { playerIdFieldSchema } from "@/lib/schemas/player";
import { notifyTargetCreated } from "@/lib/queries/db/notification/notify-targets";
import { targetMutations, targetsQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidateTargets } from "@/lib/constants/revalidate-app";
import { TargetStatus, UserRole } from "@prisma/client";
import { ErrorTypes } from "@/lib/types/primitives";

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
          status: TargetStatus.ATTENTION,
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
