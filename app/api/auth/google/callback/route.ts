import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/auth/constants";
import {
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserInfo,
} from "@/lib/auth/google-oauth";
import { createAuthSession, applySessionCookie } from "@/lib/auth/issue-session";
import { isSuperAdminEmail, normalizeAuthEmail } from "@/lib/auth/bootstrap";
import { createLogger } from "@/lib/logger";

const log = createLogger("auth.google.callback");

function redirectTo(baseUrl: string, path: string) {
  return NextResponse.redirect(new URL(path, baseUrl));
}

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    return NextResponse.redirect(new URL("/login?error=oauth_config", request.url));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthErr = url.searchParams.get("error");

  if (oauthErr) {
    return redirectTo(baseUrl, `/login?error=${encodeURIComponent(oauthErr)}`);
  }

  const jar = await cookies();
  const expected = jar.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  jar.delete(GOOGLE_OAUTH_STATE_COOKIE);

  if (!code || !state || !expected || state !== expected) {
    log.warn("OAuth state inválido ou ausente");
    return redirectTo(baseUrl, "/login?error=oauth_state");
  }

  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  let accessToken: string;
  let profile: Awaited<ReturnType<typeof fetchGoogleUserInfo>>;
  try {
    const tok = await exchangeGoogleAuthorizationCode(code, redirectUri);
    accessToken = tok.access_token;
    profile = await fetchGoogleUserInfo(accessToken);
  } catch (e) {
    log.error(
      "Falha token/userinfo Google",
      e instanceof Error ? e : undefined
    );
    return redirectTo(baseUrl, "/login?error=oauth_failed");
  }

  if (!profile.verified_email || !profile.email) {
    return redirectTo(baseUrl, "/login?error=email_not_verified");
  }

  const email = normalizeAuthEmail(profile.email);
  const googleId = profile.id;
  const nameFromGoogle = profile.name?.slice(0, 200) || null;

  try {
    const existing = await prisma.authUser.findUnique({
      where: { email },
      select: { id: true, googleSub: true, displayName: true },
    });

    if (!existing) {
      let role: UserRole;
      if (isSuperAdminEmail(email)) {
        role = UserRole.ADMIN;
      } else {
        const invite = await prisma.allowedEmail.findUnique({
          where: { email },
          select: { role: true },
        });
        if (!invite) {
          return redirectTo(baseUrl, "/register?error=not_invited");
        }
        role = invite.role;
      }

      await prisma.$transaction(async (tx) => {
        await tx.authUser.create({
          data: {
            email,
            displayName: nameFromGoogle,
            passwordHash: null,
            googleSub: googleId,
            role,
          },
        });
        if (!isSuperAdminEmail(email)) {
          await tx.allowedEmail.deleteMany({ where: { email } });
        }
      });
    } else {
      if (existing.googleSub && existing.googleSub !== googleId) {
        log.warn("Conflito googleSub", { email });
        return redirectTo(baseUrl, "/login?error=account_conflict");
      }
      if (!existing.googleSub) {
        await prisma.authUser.update({
          where: { id: existing.id },
          data: {
            googleSub: googleId,
            ...(!existing.displayName && nameFromGoogle
              ? { displayName: nameFromGoogle }
              : {}),
          },
        });
      }
    }

    const authUser = await prisma.authUser.findUniqueOrThrow({
      where: { email },
      select: {
        id: true,
        role: true,
        playerId: true,
        coachId: true,
      },
    });

    const { token, sessionId } = await createAuthSession(authUser);
    log.info("Sessão Google OK", { userId: authUser.id, sessionId });
    const res = NextResponse.redirect(new URL("/dashboard", baseUrl));
    applySessionCookie(res, token);
    return res;
  } catch (e) {
    log.error(
      "Erro ao finalizar login Google",
      e instanceof Error ? e : undefined,
      { email }
    );
    return redirectTo(baseUrl, "/login?error=oauth_failed");
  }
}
