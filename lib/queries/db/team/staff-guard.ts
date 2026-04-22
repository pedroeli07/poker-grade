import "server-only";

import { UserRole } from "@prisma/client";
import { requireSession } from "@/lib/auth/session";
import type { AppSession } from "@/lib/types/auth";

/** Staff (área /admin) — exclui jogador. */
export function assertStaffSession(session: AppSession): void {
  if (session.role === UserRole.PLAYER) {
    throw new Error("Sem permissão");
  }
}

export async function requireStaffSession(): Promise<AppSession> {
  const s = await requireSession();
  assertStaffSession(s);
  return s;
}
