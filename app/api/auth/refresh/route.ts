import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionJwt, signSessionToken } from "@/lib/auth/jwt";
import { nodeEnv, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC, SESSION_RENEWAL_THRESHOLD_SEC } from "@/lib/constants";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  let payload;
  try {
    payload = await verifySessionJwt(token);
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const jti = typeof payload.jti === "string" ? payload.jti : null;
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!jti || !sub) return NextResponse.json({ ok: false }, { status: 401 });

  const now = Date.now();
  const expMs = (payload.exp ?? 0) * 1000;
  const remainingSec = (expMs - now) / 1000;

  // Only renew if within the renewal threshold
  if (remainingSec > SESSION_RENEWAL_THRESHOLD_SEC) {
    return NextResponse.json({ ok: true, renewed: false });
  }

  const session = await prisma.authSession.findFirst({
    where: { id: jti },
    select: { expiresAt: true, userId: true },
  });

  if (!session || session.expiresAt < new Date() || session.userId !== sub) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const newExpiresAt = new Date(now + SESSION_MAX_AGE_SEC * 1000);
  await prisma.authSession.update({
    where: { id: jti },
    data: { expiresAt: newExpiresAt },
  });

  const newToken = await signSessionToken({
    userId: sub,
    role: payload.role,
    sessionId: jti,
    playerId: (payload.playerId as string | null | undefined) ?? null,
    coachId: (payload.coachId as string | null | undefined) ?? null,
    displayName: (payload.displayName as string | null | undefined) ?? null,
    email: (payload.email as string) ?? "",
  });

  const res = NextResponse.json({ ok: true, renewed: true });
  res.cookies.set(SESSION_COOKIE_NAME, newToken, {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
  return res;
}
