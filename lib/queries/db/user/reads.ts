"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants/session-rbac";
import { verifySessionJwt } from "@/lib/auth/jwt";
import { UserRole } from "@prisma/client";

export async function getUserPermissions() {
  const jar = await cookies();
  const cookie = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return { canManage: false };

  try {
    const session = await verifySessionJwt(cookie);
    if (!session) return { canManage: false };
    const role = session.role;
    return {
      canManage: role === UserRole.ADMIN || role === UserRole.MANAGER,
    };
  } catch {
    return { canManage: false };
  }
}
