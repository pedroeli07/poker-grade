import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "./constants";
import { signSessionToken, verifySessionJwt } from "./jwt";

export type AppSession = {
  userId: string;
  role: UserRole;
  sessionId: string;
  playerId: string | null;
  coachId: string | null;
};

export async function getSession(): Promise<AppSession | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  let payload;
  try {
    payload = await verifySessionJwt(token);
  } catch {
    return null;
  }

  const jti = typeof payload.jti === "string" ? payload.jti : null;
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!jti || !sub) return null;

  let row: { expiresAt: Date; userId: string } | null;
  try {
    row = await prisma.authSession.findFirst({
      where: { id: jti },
      select: { expiresAt: true, userId: true },
    });
  } catch {
    return null;
  }
  if (!row || row.expiresAt < new Date() || row.userId !== sub) {
    return null;
  }

  return {
    userId: sub,
    role: payload.role,
    sessionId: jti,
    playerId: (payload.playerId as string | null | undefined) ?? null,
    coachId: (payload.coachId as string | null | undefined) ?? null,
  };
}

export async function requireSession(): Promise<AppSession> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export function sessionHasRole(
  session: AppSession,
  roles: readonly UserRole[]
): boolean {
  return roles.includes(session.role);
}

export async function requireRoles(
  roles: readonly UserRole[]
): Promise<AppSession> {
  const s = await requireSession();
  if (!sessionHasRole(s, roles)) {
    redirect("/login?error=forbidden");
  }
  return s;
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
}

export { signSessionToken };
