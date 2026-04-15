import { Prisma } from "@prisma/client";

export const playerProfileInclude = {
  coach: true,
  gradeAssignments: {
    where: { isActive: true },
    include: {
      gradeProfile: {
        include: { rules: true, _count: { select: { rules: true } } },
      },
    },
    orderBy: { assignedAt: "desc" as const },
  },
  targets: {
    where: { isActive: true },
    orderBy: { createdAt: "desc" as const },
  },
  limitChanges: {
    orderBy: { createdAt: "desc" as const },
    take: 5,
  },
  nicks: {
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      nick: true,
      network: true,
      isActive: true,
      createdAt: true,
    },
  },
  _count: {
    select: {
      playedTournaments: true,
      reviewItems: true,
    },
  },
} satisfies Prisma.PlayerInclude;
