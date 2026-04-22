import type { AppSession } from "@/lib/types/auth";
import { UserRole } from "@prisma/client";

export function coachPlayerFilter(coachId: string) {
  return { OR: [{ coachId }, { driId: coachId }] };
}

/** Para `where` Prisma em relações `player`: filtra pelo coach quando a sessão é COACH. */
export function coachNestedPlayerWhere(session: AppSession) {
  if (session.role === UserRole.COACH && session.coachId) {
    return { player: coachPlayerFilter(session.coachId) };
  }
  return {};
}
