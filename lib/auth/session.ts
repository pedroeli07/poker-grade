import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { nodeEnv, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "@/lib/constants";
import { logPerf } from "@/lib/utils/perf";
import { signSessionToken, verifySessionJwt } from "./jwt";
import type { AppSession } from "@/lib/types";

export type { AppSession };

const log = createLogger("auth.session");



/**
 * Uma resolução por request React (RSC): layout + página + imports partilham o mesmo resultado
 * sem repetir cookies/jwt/DB.
 */
async function loadSession(): Promise<AppSession | null> {
  const tCookies = performance.now();
  const jar = await cookies();
  logPerf("auth.session", "cookies", tCookies);

  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tJwt = performance.now();
  let payload;
  try {
    payload = await verifySessionJwt(token);
  } catch {
    return null;
  }
  logPerf("auth.session", "jwt.verify", tJwt);

  const jti = typeof payload.jti === "string" ? payload.jti : null;
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!jti || !sub) return null;

  // JWT-only validation to eliminate Prisma connection overhead per request
  return {
    userId: sub,
    role: payload.role,
    sessionId: jti,
    playerId: (payload.playerId as string | null | undefined) ?? null,
    coachId: (payload.coachId as string | null | undefined) ?? null,
    displayName: (payload.displayName as string | null) ?? null,
    email: (payload.email as string) ?? "",
  };
}

export const getSession = cache(loadSession);

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
    secure: nodeEnv === "production",
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
