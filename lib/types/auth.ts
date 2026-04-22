import type { JWTPayload } from "jose";
import type { UserRole } from "@prisma/client";

type IdentityBase = {
  role: UserRole;
  playerId: string | null;
  coachId: string | null;
  displayName: string | null;
  email: string;
};

/** Sessão emitida / assinada — mesmo formato para cliente e `signSessionToken`. */
type CoreSession = IdentityBase & { userId: string; sessionId: string };

/** Dados da sessão autenticada (sem dependências de servidor — seguro para importar no cliente). */
export type AppSession = CoreSession;

export type SignSessionTokenInput = CoreSession;

/** Usuário no fluxo de emissão de sessão (sem `sessionId` ainda). */
export type IssueSessionUser = IdentityBase & { id: string };

export type SessionJwtPayload = JWTPayload & {
  role: UserRole;
  jti: string;
  playerId?: string | null;
  coachId?: string | null;
  displayName?: string | null;
  email?: string;
};

export type GoogleUserInfo = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  picture?: string;
};

type PasswordCheckKey = "minLength" | "maxLength" | "lower" | "upper" | "digit" | "special";
export type PasswordChecks = Record<PasswordCheckKey, boolean>;

export type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";
