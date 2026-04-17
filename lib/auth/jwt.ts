import { SignJWT, jwtVerify } from "jose";
import { authSecret, SESSION_MAX_AGE_SEC } from "@/lib/constants";
import type { SessionJwtPayload, SignSessionTokenInput } from "@/lib/types/session-jwt";

function getSecret(): Uint8Array {
  if (!authSecret ) {
    throw new Error("AUTH_SECRET ausente");
  }
  if (authSecret.length < 32) {
    throw new Error("AUTH_SECRET curto (mín. 32 caracteres)");
  }
  return new TextEncoder().encode(authSecret);
}

export async function signSessionToken(input: SignSessionTokenInput): Promise<string> {
  const secret = getSecret();
  return new SignJWT({
    role: input.role,
    jti: input.sessionId,
    playerId: input.playerId,
    coachId: input.coachId,
    displayName: input.displayName,
    email: input.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(secret);
}

export async function verifySessionJwt(token: string): Promise<SessionJwtPayload> {
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });
  return payload as SessionJwtPayload;
}
