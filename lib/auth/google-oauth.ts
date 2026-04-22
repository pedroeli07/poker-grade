import { googleClientId, googleClientSecret } from "@/lib/constants/env";
import { GOOGLE_OAUTH_TOKEN_URL, GOOGLE_OAUTH_USERINFO_URL } from "@/lib/constants/google-oauth";
import type { GoogleUserInfo } from "@/lib/types/auth";

export async function exchangeGoogleAuthorizationCode(
  code: string,
  redirectUri: string
): Promise<{ access_token: string }> {
  if (!googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID ausente");
  }

  if (!googleClientSecret) {
    throw new Error("GOOGLE_CLIENT_SECRET ausente");
  }

  const body = new URLSearchParams({
    code,
    client_id: googleClientId,
    client_secret: googleClientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token: ${res.status} ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<{ access_token: string }>;
}

export async function fetchGoogleUserInfo(
  accessToken: string
): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_OAUTH_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google userinfo: ${res.status}`);
  }
  return res.json() as Promise<GoogleUserInfo>;
}
