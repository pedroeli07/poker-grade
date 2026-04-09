import { PlayerStatus, UserRole } from "@prisma/client";

export const SUPER_ADMIN_EMAIL = "admin@clteam.com";

const ROLE_SELECT_DEFS = [
  [UserRole.VIEWER, "Viewer"],
  [UserRole.PLAYER, "Player"],
  [UserRole.COACH, "Coach"],
  [UserRole.MANAGER, "Manager"],
  [UserRole.ADMIN, "Admin"],
] as const satisfies readonly (readonly [UserRole, string])[];

const ROLE_SELECT_OPTIONS = ROLE_SELECT_DEFS.map(([value, label]) => ({ value, label }));

export const INVITE_ROLES = ROLE_SELECT_OPTIONS;
export const ROLE_OPTIONS = ROLE_SELECT_OPTIONS;

export const SESSION_COOKIE_NAME = "gg_session";

export const GOOGLE_OAUTH_STATE_COOKIE = "gg_oauth_state";

export const SESSION_MAX_AGE_SEC = 60 * 60 * 12;

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;

export const STAFF_WRITE_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER, UserRole.COACH];

export const GRADE_ADMIN_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER];

export const READ_ALL_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.COACH,
  UserRole.VIEWER,
  UserRole.PLAYER,
];

export const IMPORT_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER, UserRole.COACH, UserRole.PLAYER];

export const TOOLTIP_DELAY_MS = 0;

export const APP_TOASTER_PROPS = {
  position: "top-right" as const,
  richColors: true,
  closeButton: true,
};

const STATUS_DEFS = [
  [PlayerStatus.ACTIVE, "Ativo"],
  [ PlayerStatus.SUSPENDED, "Suspenso"],
  [PlayerStatus.INACTIVE, "Inativo"],
] as const satisfies readonly (readonly [PlayerStatus, string])[];

export const STATUS_OPTIONS: { value: PlayerStatus; label: string }[] = STATUS_DEFS.map(([value, label]) => ({ value, label }));
