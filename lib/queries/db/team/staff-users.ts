"use server";

import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { staffListRead } from "@/lib/queries/db/team/staff-read";

export async function listStaffUsersForSelect() {
  return staffListRead(() =>
    prisma.authUser.findMany({
      where: { role: { not: UserRole.PLAYER } },
      select: { id: true, displayName: true, email: true, role: true },
      orderBy: [{ displayName: "asc" }, { email: "asc" }],
    }),
  );
}
