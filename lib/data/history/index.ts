import type { AppSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { TargetLimit } from "@/lib/types";
import { UserRole } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export const HISTORY_PAGE_SIZE_DEFAULT = 10;

type HistoryWhere = Prisma.LimitChangeHistoryWhereInput;

function buildHistoryWhere(session: AppSession): HistoryWhere | null {
  if (session.role === UserRole.PLAYER) {
    if (!session.playerId) return null;
    return { playerId: session.playerId };
  }
  if (session.role === UserRole.COACH && session.coachId) {
    return {
      player: {
        OR: [{ coachId: session.coachId }, { driId: session.coachId }],
      },
    };
  }
  return {};
}

export async function loadHistoryPageData(
  session: AppSession,
  opts?: { page?: number; pageSize?: number }
) {
  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = Math.max(1, Math.min(1000, opts?.pageSize ?? HISTORY_PAGE_SIZE_DEFAULT));

  const where = buildHistoryWhere(session);
  if (!where) {
    return {
      history: [],
      upgrades: 0,
      downgrades: 0,
      maintains: 0,
      total: 0,
      page,
      pageSize,
      totalPages: 1,
      isPlayer: true,
    };
  }

  const [total, upgrades, downgrades, maintains, history] = await Promise.all([
    prisma.limitChangeHistory.count({ where }),
    prisma.limitChangeHistory.count({ where: { ...where, action: TargetLimit.UPGRADE } }),
    prisma.limitChangeHistory.count({ where: { ...where, action: TargetLimit.DOWNGRADE } }),
    prisma.limitChangeHistory.count({ where: { ...where, action: TargetLimit.MAINTAIN } }),
    prisma.limitChangeHistory.findMany({
      where,
      include: { player: { select: { id: true, name: true, nickname: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const decidedByIds = [...new Set(history.map((h) => h.decidedBy).filter(Boolean))] as string[];
  const decidedByUsers =
    decidedByIds.length > 0
      ? await prisma.authUser.findMany({
          where: { id: { in: decidedByIds } },
          select: { id: true, displayName: true, email: true },
        })
      : [];
  const decidedByMap = new Map(
    decidedByUsers.map((u) => [u.id, u.displayName ?? u.email])
  );

  const enriched = history.map((h) => ({
    ...h,
    decidedByName: h.decidedBy ? decidedByMap.get(h.decidedBy) ?? null : null,
  }));

  return {
    history: enriched,
    upgrades,
    downgrades,
    maintains,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    isPlayer: session.role === UserRole.PLAYER,
  };
}

export type HistoryPageData = Awaited<ReturnType<typeof loadHistoryPageData>>;
export type HistoryItem = HistoryPageData["history"][number];
