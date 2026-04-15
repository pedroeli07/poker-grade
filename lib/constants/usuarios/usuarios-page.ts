import { UserRole } from "@prisma/client";

export const USUARIOS_PAGE_ALLOWED_ROLES = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.COACH,
] as const;

export const USUARIOS_TABLE_ENTITY_LABELS: [string, string] = [
  "utilizador",
  "utilizadores",
];
