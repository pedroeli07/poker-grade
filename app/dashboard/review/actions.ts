"use server";

import { prisma } from "@/lib/prisma";
import type { ReviewStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import { requireSession } from "@/lib/auth/session";
import { assertCanReview } from "@/lib/auth/rbac";
import { processReviewSchema } from "@/lib/validation/schemas";
import { sanitizeOptional } from "@/lib/sanitize";
import { assertReviewAccessible } from "@/lib/data/queries";
import { notifyReviewDecision } from "@/lib/notifications";

const log = createLogger("review.actions");

export async function processReview(
  reviewId: string,
  status: ReviewStatus,
  notes?: string
) {
  const session = await requireSession();
  assertCanReview(session);

  const parsed = processReviewSchema.safeParse({
    reviewId,
    status,
    notes: notes ?? null,
  });
  if (!parsed.success) {
    log.warn("processReview validação falhou");
    throw new Error("Dados inválidos");
  }

  await assertReviewAccessible(session, parsed.data.reviewId);

  log.info("Atualizando revisão", {
    reviewId: parsed.data.reviewId,
    status: parsed.data.status,
  });

  const isInfraction = parsed.data.status === "REJECTED";
  const reviewNotes = sanitizeOptional(parsed.data.notes ?? null, 5000);

  const updated = await prisma.gradeReviewItem.update({
    where: { id: parsed.data.reviewId },
    data: {
      status: parsed.data.status,
      isInfraction,
      reviewNotes,
      reviewedAt: new Date(),
      reviewedBy: session.userId,
    },
    include: {
      tournament: { select: { tournamentName: true } },
    },
  });

  if (parsed.data.status === "APPROVED" || parsed.data.status === "EXCEPTION" || parsed.data.status === "REJECTED") {
    void notifyReviewDecision(
      updated.playerId,
      updated.tournament.tournamentName,
      parsed.data.status as "APPROVED" | "EXCEPTION" | "REJECTED"
    );
  }

  revalidatePath("/dashboard/review");
  log.success("Revisão gravada", {
    reviewId: parsed.data.reviewId,
    status: parsed.data.status,
    isInfraction,
  });
  return { success: true };
}
