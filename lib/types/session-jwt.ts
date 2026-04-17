import type { JWTPayload } from "jose";
import type { UserRole } from "@prisma/client";

export type SessionJwtPayload = JWTPayload & {
  role: UserRole;
  jti: string;
  playerId?: string | null;
  coachId?: string | null;
  displayName?: string | null;
  email?: string;
};

export type SignSessionTokenInput = {
  userId: string;
  role: UserRole;
  sessionId: string;
  playerId: string | null;
  coachId: string | null;
  displayName: string | null;
  email: string;
};
