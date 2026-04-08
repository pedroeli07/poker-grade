import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signSessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "@/lib/constants";
import type { UserRole } from "@prisma/client";

type UserRow = {
  id: string;
  role: UserRole;
  playerId: string | null;
  coachId: string | null;
  displayName: string | null;
  email: string;
};

export async function createAuthSession(user: UserRow): Promise<{
  token: string;
  sessionId: string;
}> {
  const session = await prisma.authSession.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000),
    },
  });

  const token = await signSessionToken({
    userId: user.id,
    role: user.role,
    sessionId: session.id,
    playerId: user.playerId,
    coachId: user.coachId,
    displayName: user.displayName,
    email: user.email,
  });

  return { token, sessionId: session.id };
}

export function applySessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}
