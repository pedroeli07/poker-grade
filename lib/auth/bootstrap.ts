/**
 * Conta bootstrap: único e-mail que pode registrar sem estar em {@link AllowedEmail}.
 */
export const SUPER_ADMIN_EMAIL = "admin@clteam.com";

export function normalizeAuthEmail(raw: string): string {
  return raw.toLowerCase().trim();
}

export function isSuperAdminEmail(email: string): boolean {
  return normalizeAuthEmail(email) === SUPER_ADMIN_EMAIL;
}
