"use server";

import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getAdminUserIds(): Promise<string[]> {
  const users = await prisma.authUser.findMany({
    where: { role: { in: [UserRole.ADMIN, UserRole.MANAGER] } },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function getStaffUserIds(): Promise<string[]> {
  const users = await prisma.authUser.findMany({
    where: { role: { in: [UserRole.ADMIN, UserRole.MANAGER, UserRole.COACH] } },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function getPlayerAuthUserId(playerId: string): Promise<string | null> {
  const row = await prisma.authUser.findFirst({ where: { playerId }, select: { id: true } });
  return row?.id ?? null;
}
