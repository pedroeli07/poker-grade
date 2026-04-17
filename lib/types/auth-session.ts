import type { UserRole } from "@prisma/client";

/** Dados da sessão autenticada (sem dependências de servidor — seguro para importar no cliente). */
export type AppSession = {
  userId: string;
  role: UserRole;
  sessionId: string;
  playerId: string | null;
  coachId: string | null;
  displayName: string | null;
  email: string;
};
