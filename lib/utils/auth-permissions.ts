import { UserRole } from "@prisma/client";
import { ErrorTypes } from "@/lib/types";
import { GRADE_ADMIN_ROLES, IMPORT_ROLES, STAFF_WRITE_ROLES } from "@/lib/constants";
import type { AppSession } from "@/lib/auth/session";

export const canWriteOperations = (s: AppSession) => STAFF_WRITE_ROLES.includes(s.role);
export const canManageGrades = (s: AppSession) => GRADE_ADMIN_ROLES.includes(s.role);
export const canEditGradeCoachNote = canWriteOperations;
export const canReview = canWriteOperations;
export const canDeleteImports = canWriteOperations;

export const canViewPlayer = (
  session: { role: string; coachId?: string | null; playerId?: string | null },
  player: { id: string; coachId: string | null; driId: string | null }
) => {
  const viewAllRoles: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER];
  if (viewAllRoles.includes(session.role as UserRole)) return true;
  if (session.role === UserRole.COACH && session.coachId)
    return player.coachId === session.coachId || player.driId === session.coachId;
  if (session.role === UserRole.PLAYER) return session.playerId === player.id;
  return false;
};

export function canManagePlayerProfile(
  session: AppSession,
  player: { coachId: string | null; driId: string | null }
): boolean {
  if (session.role === UserRole.ADMIN || session.role === UserRole.MANAGER) return true;
  return (
    session.role === UserRole.COACH &&
    !!session.coachId &&
    (player.coachId === session.coachId || player.driId === session.coachId)
  );
}

/** Factory de asserts de permissão — lança FORBIDDEN se o predicado falhar */
const assertCan = (predicate: (s: AppSession) => boolean) => (s: AppSession) => {
  if (!predicate(s)) throw new Error(ErrorTypes.FORBIDDEN);
};

export const assertCanWrite = assertCan(canWriteOperations);
export const assertCanManageGrades = assertCan(canManageGrades);
export const assertCanReview = assertCan(canReview);
export const assertCanImport = assertCan((s) => IMPORT_ROLES.includes(s.role));

export const isSharkscopeStaffRole = (role: UserRole) => STAFF_WRITE_ROLES.includes(role);
export const isScoutingStaffRole = (role: UserRole) => GRADE_ADMIN_ROLES.includes(role);
