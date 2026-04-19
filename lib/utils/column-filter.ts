import type { ReactNode } from "react";

export type ColumnFilterOption = { value: string; label: string };

export function columnFilterValueKeys(options: ColumnFilterOption[]): Set<string> {
  return new Set(options.map((o) => o.value));
}

export function filterColumnOptionsBySearch(
  options: ColumnFilterOption[],
  search: string
): ColumnFilterOption[] {
  const q = search.trim().toLowerCase();
  if (!q) return options;
  return options.filter(
    (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
  );
}

export function resolveColumnFilterAriaLabel(
  columnId: string,
  label: ReactNode,
  ariaLabel?: string
): string {
  return (
    ariaLabel ??
    (typeof label === "string" || typeof label === "number" ? String(label) : columnId)
  );
}

export function initialColumnFilterPending(
  applied: Set<string> | null,
  allKeys: Set<string>
): Set<string> {
  return applied === null ? new Set(allKeys) : new Set(applied);
}

export function commitColumnFilterSelection(
  next: Set<string>,
  allKeys: Set<string>,
  onApply: (next: Set<string> | null) => void
): void {
  if (next.size === 0) {
    onApply(new Set());
    return;
  }
  if (next.size === allKeys.size) {
    onApply(null);
    return;
  }
  onApply(next);
}
