import { prisma } from "@/lib/prisma";
import type { AppSession } from "@/lib/auth/session";

function coachPlayerFilter(coachId: string) {
  return {
    OR: [{ coachId }, { driId: coachId }],
  };
}

export async function getPlayersForSession(session: AppSession) {
  const base = {
    include: {
      coach: true,
      gradeAssignments: {
        where: { isActive: true as const, gradeType: "MAIN" as const },
        include: { gradeProfile: true },
      },
    },
    orderBy: { name: "asc" as const },
  };

  switch (session.role) {
    case "ADMIN":
    case "MANAGER":
    case "VIEWER":
      return prisma.player.findMany({ ...base, where: {} });
    case "COACH":
      if (!session.coachId) return [];
      return prisma.player.findMany({
        ...base,
        where: coachPlayerFilter(session.coachId),
      });
    case "PLAYER":
      if (!session.playerId) return [];
      return prisma.player.findMany({
        ...base,
        where: { id: session.playerId },
      });
    default:
      return [];
  }
}

export async function getTargetsForSession(session: AppSession) {
  const where =
    session.role === "COACH" && session.coachId
      ? { player: coachPlayerFilter(session.coachId) }
      : session.role === "PLAYER" && session.playerId
        ? { playerId: session.playerId }
        : session.role === "ADMIN" ||
            session.role === "MANAGER" ||
            session.role === "VIEWER"
          ? {}
          : { id: "___none___" };

  return prisma.playerTarget.findMany({
    where,
    include: { player: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingReviewsForSession(session: AppSession) {
  if (session.role === "PLAYER") {
    return [];
  }

  const where: {
    status: "PENDING";
    player?: ReturnType<typeof coachPlayerFilter>;
  } = { status: "PENDING" };

  if (session.role === "COACH" && session.coachId) {
    where.player = coachPlayerFilter(session.coachId);
  }

  return prisma.gradeReviewItem.findMany({
    where,
    include: {
      player: { include: { coach: true } },
      tournament: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getImportsForSession(session: AppSession) {
  const take = 50;
  const orderBy = { createdAt: "desc" as const };

  if (session.role === "ADMIN" || session.role === "MANAGER" || session.role === "VIEWER") {
    return prisma.tournamentImport.findMany({ orderBy, take });
  }

  if (session.role === "COACH" && session.coachId) {
    const players = await prisma.player.findMany({
      where: coachPlayerFilter(session.coachId),
      select: { name: true, nickname: true },
    });
    const names = [
      ...new Set(
        players.flatMap((p) => [p.name, p.nickname].filter(Boolean) as string[])
      ),
    ];
    if (names.length === 0) return [];
    return prisma.tournamentImport.findMany({
      where: {
        OR: names.map((n) => ({
          playerName: { equals: n, mode: "insensitive" as const },
        })),
      },
      orderBy,
      take,
    });
  }

  if (session.role === "PLAYER" && session.playerId) {
    const p = await prisma.player.findUnique({
      where: { id: session.playerId },
      select: { name: true, nickname: true },
    });
    if (!p) return [];
    const or = [
      { playerName: { equals: p.name, mode: "insensitive" as const } },
    ];
    if (p.nickname) {
      or.push({
        playerName: { equals: p.nickname, mode: "insensitive" as const },
      });
    }
    return prisma.tournamentImport.findMany({
      where: { OR: or },
      orderBy,
      take,
    });
  }

  return [];
}

export async function getGradesForSession(session: AppSession) {
  if (session.role === "PLAYER") {
    if (!session.playerId) return [];
    const assigned = await prisma.playerGradeAssignment.findMany({
      where: { playerId: session.playerId, isActive: true },
      select: { gradeId: true },
    });
    const ids = assigned.map((a) => a.gradeId);
    if (ids.length === 0) return [];
    return prisma.gradeProfile.findMany({
      where: { id: { in: ids } },
      include: {
        _count: { select: { rules: true, assignments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.gradeProfile.findMany({
    include: {
      _count: { select: { rules: true, assignments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGradeByIdForSession(session: AppSession, id: string) {
  const grade = await prisma.gradeProfile.findUnique({
    where: { id },
    include: {
      rules: true,
      _count: { select: { assignments: true } },
    },
  });
  if (!grade) return null;

  if (session.role === "PLAYER" && session.playerId) {
    const ok = await prisma.playerGradeAssignment.findFirst({
      where: {
        playerId: session.playerId,
        gradeId: id,
        isActive: true,
      },
    });
    if (!ok) return null;
  }

  return grade;
}

export async function assertReviewAccessible(
  session: AppSession,
  reviewId: string
): Promise<void> {
  const item = await prisma.gradeReviewItem.findUnique({
    where: { id: reviewId },
    select: { playerId: true },
  });
  if (!item) throw new Error("NOT_FOUND");

  if (session.role === "ADMIN" || session.role === "MANAGER") return;

  if (session.role === "COACH" && session.coachId) {
    const p = await prisma.player.findFirst({
      where: {
        id: item.playerId,
        ...coachPlayerFilter(session.coachId),
      },
      select: { id: true },
    });
    if (!p) throw new Error("FORBIDDEN");
    return;
  }

  throw new Error("FORBIDDEN");
}
