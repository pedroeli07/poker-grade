import { ritualDriSelectIdForMatrixFreeName } from "@/lib/utils/team/ritual-dri-select";

export type StaffSelectOption = { id: string; name: string };

type StaffRow = { id: string; displayName: string | null; email: string };

type DriRow = {
  authUserId: string | null;
  responsibleName: string | null;
  authUser: StaffRow | null;
};

function hasDisplayName(options: StaffSelectOption[], displayName: string): boolean {
  return options.some(
    (o) => o.name.localeCompare(displayName, "pt", { sensitivity: "base" }) === 0,
  );
}

/**
 * Base: tipicamente admin, gestor e coach (`listAssignableStaffUsersForSelect`).
 * Inclui contas vinculadas na matriz DRI, nomes da matriz resolvidos para `AuthUser` por displayName
 * e responsáveis **só com texto** na matriz (sem conta) — usam id sintético `n:…` no select de rituais.
 */
export function mergeStaffSelectOptionsWithDriMatrix(
  staff: StaffRow[],
  dris: DriRow[],
  resolvedFromFreeText: StaffRow[],
): StaffSelectOption[] {
  const byId = new Map<string, StaffSelectOption>();
  for (const u of staff) {
    byId.set(u.id, { id: u.id, name: (u.displayName || u.email).trim() });
  }
  for (const d of dris) {
    const u = d.authUser;
    if (!d.authUserId || !u || byId.has(u.id)) continue;
    byId.set(u.id, { id: u.id, name: (u.displayName || u.email).trim() });
  }
  for (const u of resolvedFromFreeText) {
    if (byId.has(u.id)) continue;
    byId.set(u.id, { id: u.id, name: (u.displayName || u.email).trim() });
  }
  for (const d of dris) {
    if (d.authUserId) continue;
    const raw = d.responsibleName?.trim();
    if (!raw) continue;
    if (hasDisplayName([...byId.values()], raw)) continue;
    const id = ritualDriSelectIdForMatrixFreeName(raw);
    if (byId.has(id)) continue;
    byId.set(id, { id, name: raw });
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "pt", { sensitivity: "base" }));
}
