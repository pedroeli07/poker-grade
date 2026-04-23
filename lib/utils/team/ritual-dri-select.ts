/**
 * Responsável sem conta na matriz DRI: mesmo prefixo usado em `driResponsibleValue` (governance-dri-filters).
 */
const FREE_NAME_PREFIX = "n:" as const;

export function ritualDriSelectIdForMatrixFreeName(name: string): string {
  return `${FREE_NAME_PREFIX}${name.trim()}`;
}

export function ritualDriFormValueFromRitual(
  driId: string | null | undefined,
  responsibleName: string | null | undefined,
): string {
  if (driId) return driId;
  if (responsibleName?.trim()) return ritualDriSelectIdForMatrixFreeName(responsibleName);
  return "";
}

export function parseRitualDriForSave(driIdForm: string | null | undefined): {
  driId: string | null;
  responsibleName: string | null;
} {
  const v = driIdForm?.trim();
  if (!v) return { driId: null, responsibleName: null };
  if (v.startsWith("n:")) {
    const name = v.slice(2).trim();
    return { driId: null, responsibleName: name || null };
  }
  return { driId: v, responsibleName: null };
}
