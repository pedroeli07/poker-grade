"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AppSession } from "@/lib/auth/session";
import { assertCanReview } from "@/lib/auth/rbac";
import { processReviewSchema } from "@/lib/schemas";
import { sanitizeOptional } from "@/lib/utils";
import { notifyReviewDecision } from "@/lib/queries/db/notification-queries";
import { coachNestedPlayerWhere, coachPlayerFilter } from "./shared";
import { ReviewStatus, UserRole } from "@prisma/client";
import { ErrorTypes } from "@/lib/types";
import { reviewMutations, reviewQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidateReview } from "@/lib/constants/revalidate-app";

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getPendingReviewsForSession(session: AppSession) {
  if (session.role === UserRole.PLAYER) return [];
  const where: Prisma.GradeReviewItemWhereInput = {
    status: ReviewStatus.PENDING,
    ...coachNestedPlayerWhere(session),
  };
  return prisma.gradeReviewItem.findMany({
    where,
    include: { player: { include: { coach: true } }, tournament: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function assertReviewAccessible(session: AppSession, reviewId: string): Promise<void> {
  const item = await prisma.gradeReviewItem.findUnique({ where: { id: reviewId }, select: { playerId: true } });
  if (!item) throw new Error(ErrorTypes.NOT_FOUND);
  if (session.role === UserRole.ADMIN || session.role === UserRole.MANAGER) return;
  if (session.role === UserRole.COACH && session.coachId) {
    const p = await prisma.player.findFirst({ where: { id: item.playerId, ...coachPlayerFilter(session.coachId) }, select: { id: true } });
    if (!p) throw new Error(ErrorTypes.FORBIDDEN);
    return;
  }
  throw new Error(ErrorTypes.FORBIDDEN);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function processReview(
  reviewId: string,
  status: ReviewStatus,
  notes?: string
) {
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
          isInfraction, reviewNotes,
          reviewedAt: new Date(), reviewedBy: session.userId,
        },
        include: { tournament: { select: { tournamentName: true } } },
      });
    } catch (e) {
      reviewQueriesLog.error("processReview persistência", e instanceof Error ? e : undefined, { reviewId: parsed.data.reviewId });
      throw new Error("Não foi possível salvar a revisão.");
    }

    if (parsed.data.status === ReviewStatus.APPROVED || parsed.data.status === ReviewStatus.EXCEPTION || parsed.data.status === ReviewStatus.REJECTED) {
      void notifyReviewDecision(
        updated.playerId,
        updated.tournament.tournamentName,
        parsed.data.status
      );
    }

    reviewQueriesLog.success("Revisão gravada", { reviewId: parsed.data.reviewId, status: parsed.data.status, isInfraction });
  }, () => revalidateReview());
}
