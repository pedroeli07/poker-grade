import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { UserRole } from "@prisma/client";
import { SESSION_MAX_AGE_SEC } from "@/lib/constants";

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET ausente ou curto (mín. 32 caracteres)");
  }
  return new TextEncoder().encode(s);
}

export type SessionJwtPayload = JWTPayload & {
  role: UserRole;
  jti: string;
  playerId?: string | null;
  coachId?: string | null;
  displayName?: string | null;
  email?: string;
};

export async function signSessionToken(input: {
  userId: string;
  role: UserRole;
  sessionId: string;
  playerId: string | null;
  coachId: string | null;
  displayName: string | null;
  email: string;
}): Promise<string> {
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

export async function verifySessionJwt(
  token: string
): Promise<SessionJwtPayload> {
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });
  return payload as SessionJwtPayload;
}
