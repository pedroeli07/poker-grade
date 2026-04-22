import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { loginBodySchema } from "@/lib/schemas/auth";
import { limitLogin } from "@/lib/rate-limit";
import { clientIp, assertSameOrigin } from "@/lib/api/origin";
import {
  logLoginFailure,
  logLoginSuccess,
  logRateLimited,
  logValidationFailure,
} from "@/lib/security-log";
import { createLogger } from "@/lib/logger";
import { createAuthSession, applySessionCookie } from "@/lib/auth/issue-session";
import { ensureCoachProfileLinked } from "@/lib/auth/ensure-coach-profile";
import { ensurePlayerProfileLinked } from "@/lib/auth/ensure-player-profile";
import { LOCKOUT_MINUTES, MAX_LOGIN_ATTEMPTS } from "@/lib/constants/session-rbac";
import { ErrorTypes } from "@/lib/types/primitives";
const log = createLogger("auth.login");

const GENERIC = "Credenciais inválidas.";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: ErrorTypes.FORBIDDEN }, { status: 403 });
  }

  const ip = clientIp(request);
  const rl = await limitLogin(ip);
  if (!rl.ok) {
    logRateLimited("/api/auth/login", ip);
    return NextResponse.json(
      { error: "Muitas tentativas. Tente mais tarde." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logValidationFailure("login.json");
    return NextResponse.json({ error: GENERIC }, { status: 400 });
  }

  const parsed = loginBodySchema.safeParse(body);
  if (!parsed.success) {
    logValidationFailure("login.fields");
    return NextResponse.json({ error: GENERIC }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.authUser.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
      role: true,
      playerId: true,
      coachId: true,
      lockedUntil: true,
      failedAttempts: true,
      displayName: true,
      email: true,
    },
  });

  if (!user) {
    logLoginFailure(ip, "unknown_user");
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    logLoginFailure(ip, "locked");
    return NextResponse.json(
      { error: "Conta temporariamente bloqueada. Tente mais tarde." },
      { status: 423 }
    );
  }

  if (!user.passwordHash) {
    logLoginFailure(ip, "oauth_only");
    return NextResponse.json(
      {
        error:
          "Esta conta usa apenas o Google. Use o botão «Entrar com Google».",
      },
      { status: 401 }
    );
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    const attempts = user.failedAttempts + 1;
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      await prisma.authUser.update({
        where: { id: user.id },
        data: {
          lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000),
          failedAttempts: 0,
          lastFailedAt: new Date(),
        },
      });
    } else {
      await prisma.authUser.update({
        where: { id: user.id },
        data: {
          failedAttempts: attempts,
          lastFailedAt: new Date(),
        },
      });
    }
    logLoginFailure(ip, "bad_password");
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }

  await prisma.authUser.update({
    where: { id: user.id },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
      lastFailedAt: null,
    },
  });

  const linkedCoachId = await ensureCoachProfileLinked(user.id);
  const linkedPlayerId = await ensurePlayerProfileLinked(user.id);

  const { token, sessionId } = await createAuthSession({
    id: user.id,
    role: user.role,
    playerId: linkedPlayerId ?? user.playerId,
    coachId: linkedCoachId ?? user.coachId,
    displayName: user.displayName,
    email: user.email,
  });

  logLoginSuccess(user.id);
  log.info("Sessão criada", { userId: user.id, sessionId });

  const res = NextResponse.json({ ok: true });
  applySessionCookie(res, token);
  return res;
}
