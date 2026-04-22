"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { coachNestedPlayerWhere, coachPlayerFilter } from "../shared";
import { ReviewStatus, UserRole } from "@prisma/client";
import { ErrorTypes } from "@/lib/types/primitives";
import { AppSession } from "@/lib/types/auth";

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
    const p = await prisma.player.findFirst({
      where: { id: item.playerId, ...coachPlayerFilter(session.coachId) },
      select: { id: true },
    });
    if (!p) throw new Error(ErrorTypes.FORBIDDEN);
    return;
  }
  throw new Error(ErrorTypes.FORBIDDEN);
}
