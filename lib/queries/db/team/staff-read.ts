import "server-only";

import { getSession } from "@/lib/auth/session";
import { assertStaffSession } from "@/lib/queries/db/team/staff-guard";

export async function staffRead<T>(empty: T, run: () => Promise<T>): Promise<T> {
  const s = await getSession();
  if (!s) return empty;
  try {
    assertStaffSession(s);
  } catch {
    return empty;
  }
  return run();
}

/** Listagens staff — `[]` tipado em `R[]`. */
export async function staffListRead<R>(run: () => Promise<R[]>): Promise<R[]> {
  return staffRead<R[]>([], run);
}
