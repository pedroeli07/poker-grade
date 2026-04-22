"use server";

import { prisma } from "@/lib/prisma";
import { assertCanReview } from "@/lib/auth/rbac";
import { processReviewSchema } from "@/lib/schemas/review-import";
import { sanitizeOptional } from "@/lib/utils/text-sanitize";
import { notifyReviewDecision } from "@/lib/queries/db/notification/notify-reviews-limits";
import { reviewMutations, reviewQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidateReview } from "@/lib/constants/revalidate-app";
import { ReviewStatus } from "@prisma/client";
import { ErrorTypes } from "@/lib/types/primitives";
import { assertReviewAccessible } from "./reads";

export async function processReview(reviewId: string, status: ReviewStatus, notes?: string) {
  return reviewMutations.run(assertCanReview, async (session) => {
    const parsed = processReviewSchema.safeParse({ reviewId, status, notes: notes ?? null });
    if (!parsed.success) {
      reviewQueriesLog.warn("processReview validação falhou");
      throw new Error(ErrorTypes.INVALID_DATA);
    }

    await assertReviewAccessible(session, parsed.data.reviewId);

    reviewQueriesLog.info("Atualizando revisão", { reviewId: parsed.data.reviewId, status: parsed.data.status });

    const isInfraction = parsed.data.status === ReviewStatus.REJECTED;
    const reviewNotes = sanitizeOptional(parsed.data.notes ?? null, 5000);

    let updated;
    try {
      updated = await prisma.gradeReviewItem.update({
        where: { id: parsed.data.reviewId },
        data: {
          status: parsed.data.status,
          isInfraction,
          reviewNotes,
          reviewedAt: new Date(),
          reviewedBy: session.userId,
        },
        include: { tournament: { select: { tournamentName: true } } },
      });
    } catch (e) {
      reviewQueriesLog.error("processReview persistência", e instanceof Error ? e : undefined, {
        reviewId: parsed.data.reviewId,
      });
      throw new Error(ErrorTypes.OPERATION_FAILED);
    }

    if (
      parsed.data.status === ReviewStatus.APPROVED ||
      parsed.data.status === ReviewStatus.EXCEPTION ||
      parsed.data.status === ReviewStatus.REJECTED
    ) {
      void notifyReviewDecision(
        updated.playerId,
        updated.tournament.tournamentName,
        parsed.data.status
      );
    }

    reviewQueriesLog.success("Revisão gravada", {
      reviewId: parsed.data.reviewId,
      status: parsed.data.status,
      isInfraction,
    });
  }, () => revalidateReview());
}
