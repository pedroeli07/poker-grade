export function distinctOptions<T>(rows: T[], pick: (r: T) => { value: string; label: string }) {
  const map = new Map<string, string>();
  for (const r of rows) {
    const { value, label } = pick(r);
    if (!map.has(value)) map.set(value, label);
  }
  return [...map.entries()]
    .sort(([, a], [, b]) => a.localeCompare(b, "pt-BR"))
    .map(([value, label]) => ({ value, label }));
}
