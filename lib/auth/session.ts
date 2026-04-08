import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "@/lib/constants";
import { signSessionToken, verifySessionJwt } from "./jwt";

const log = createLogger("auth.session");

export type AppSession = {
  userId: string;
  role: UserRole;
  sessionId: string;
  playerId: string | null;
  coachId: string | null;
  displayName: string | null;
  email: string;
};

const DB_ERROR = Symbol("DB_ERROR");

async function querySessionFromDb(
  jti: string
): Promise<{ expiresAt: Date; userId: string } | null | typeof DB_ERROR> {
  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.authSession.findFirst({
        where: { id: jti },
        select: { expiresAt: true, userId: true },
      });
    } catch (err) {
      if (attempt < maxRetries) {
        log.warn("DB session query failed, retrying", {
          attempt: attempt + 1,
          err: err instanceof Error ? err.message : String(err),
        });
        await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
      } else {
        log.error(
          "DB session query failed after retries",
          err instanceof Error ? err : undefined,
          { jti }
        );
        return DB_ERROR;
      }
    }
  }
  return DB_ERROR;
}

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

  const row = await querySessionFromDb(jti);

  // DB was unreachable — trust the cryptographically verified JWT.
  // This prevents false login redirects during Prisma hot-reload or transient DB errors.
  if (row === DB_ERROR) {
    log.warn("Trusting JWT — DB unavailable for session validation", { userId: sub });
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

  // Session not found or expired — genuinely invalid
  if (!row || row.expiresAt < new Date() || row.userId !== sub) {
    return null;
  }

  const user = await prisma.authUser.findUnique({
    where: { id: sub },
    select: { displayName: true, email: true },
  });

  return {
    userId: sub,
    role: payload.role,
    sessionId: jti,
    playerId: (payload.playerId as string | null | undefined) ?? null,
    coachId: (payload.coachId as string | null | undefined) ?? null,
    displayName: user?.displayName ?? null,
    email: user?.email ?? "",
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
