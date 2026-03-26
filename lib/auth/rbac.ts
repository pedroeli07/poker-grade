import type { UserRole } from "@prisma/client";
import type { AppSession } from "./session";

/** Escrita operacional (import, jogadores, revisão) */
export const STAFF_WRITE_ROLES: UserRole[] = ["ADMIN", "MANAGER", "COACH"];

/** Gestão de grades (criar / importar / apagar) */
export const GRADE_ADMIN_ROLES: UserRole[] = ["ADMIN", "MANAGER"];

/** Só leitura no dashboard */
export const READ_ALL_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "COACH",
  "VIEWER",
  "PLAYER",
];

export function canWriteOperations(session: AppSession): boolean {
  return STAFF_WRITE_ROLES.includes(session.role);
}

export function canManageGrades(session: AppSession): boolean {
  return GRADE_ADMIN_ROLES.includes(session.role);
}

export function canReview(session: AppSession): boolean {
  return (
    session.role === "ADMIN" ||
    session.role === "MANAGER" ||
    session.role === "COACH"
  );
}

export function assertCanWrite(session: AppSession): void {
  if (!canWriteOperations(session)) {
    throw new Error("FORBIDDEN");
  }
}

/** Importação Excel — jogador pode enviar apenas a própria aba (checado na action). */
export const IMPORT_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "COACH",
  "PLAYER",
];

export function assertCanImport(session: AppSession): void {
  if (!IMPORT_ROLES.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
}

export function assertCanManageGrades(session: AppSession): void {
  if (!canManageGrades(session)) {
    throw new Error("FORBIDDEN");
  }
}

export function assertCanReview(session: AppSession): void {
  if (!canReview(session)) {
    throw new Error("FORBIDDEN");
  }
}
