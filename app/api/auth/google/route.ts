import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/constants";
import { createLogger } from "@/lib/logger";

const log = createLogger("auth.google.start");

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (!clientId || !baseUrl) {
    log.warn("OAuth Google não configurado (CLIENT_ID ou APP_URL)");
    return NextResponse.json(
      { error: "Login com Google não está configurado." },
      { status: 503 }
    );
  }

  const state = randomBytes(32).toString("base64url");
  const jar = await cookies();
  jar.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const redirectUri = `${baseUrl}/api/auth/callback/google`;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "online");
  authUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authUrl.toString());
}
