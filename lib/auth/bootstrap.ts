export function isSuperAdminEmail(email: string): boolean {
  return email === process.env.SUPER_ADMIN_EMAIL;
}

export function normalizeAuthEmail(raw: string): string {
  return raw.trim().toLowerCase();
}