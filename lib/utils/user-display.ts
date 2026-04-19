import { initials } from "./player";

export function getUserDisplayInitials(displayName: string | null, email: string): string {
  const d = displayName?.trim();
  if (d) return initials(d);
  const f = email?.[0];
  return f ? f.toUpperCase() : "?";
}
