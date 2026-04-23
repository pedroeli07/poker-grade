import type { TeamIndicatorDTO } from "@/lib/data/team/indicators-page";
import type { StaffSelectOption } from "@/lib/utils/team/staff-select-options-merge";

/** Preenche `authUserId` do formulário a partir do dono ou do nome salvo (legado) casando com a lista staff+DRI. */
export function resolveIndicatorFormAuthUserId(
  row: Pick<TeamIndicatorDTO, "authUserId" | "responsibleName">,
  staff: readonly StaffSelectOption[],
): string | null {
  if (row.authUserId && staff.some((s) => s.id === row.authUserId)) return row.authUserId;
  const n = row.responsibleName?.trim();
  if (!n) return row.authUserId ?? null;
  const hit = staff.find((s) => s.name.localeCompare(n, "pt", { sensitivity: "base" }) === 0);
  return hit?.id ?? row.authUserId ?? null;
}
