import { superAdminEmail } from "../constants";

export function isSuperAdminEmail(email: string): boolean {
  return email === superAdminEmail;
}

export function normalizeAuthEmail(raw: string): string {
  return raw.trim().toLowerCase();
}