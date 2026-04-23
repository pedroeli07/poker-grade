"use server";

import { prisma } from "@/lib/prisma";
import { AUTH_USER_MIN } from "@/lib/constants/team/prisma-includes";
import { staffListRead } from "@/lib/queries/db/team/staff-read";

export async function listTeamDri() {
  return staffListRead(() =>
    prisma.teamDri.findMany({ orderBy: { area: "asc" }, include: { authUser: AUTH_USER_MIN } }),
  );
}

/** Resolve `AuthUser` por nome de exibição exato (case-insensitive) — p.ex. `TeamDri.responsibleName` sem `authUserId`. */
export async function findAuthUsersByExactDisplayNames(names: string[]) {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (unique.length === 0) return [];
  return staffListRead(() =>
    prisma.authUser.findMany({
      where: {
        OR: unique.map((name) => ({
          displayName: { equals: name, mode: "insensitive" as const },
        })),
      },
      select: { id: true, displayName: true, email: true },
    }),
  );
}
