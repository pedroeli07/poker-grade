export function distinctOptions<T>(
  rows: T[],
  pick: (r: T) => { value: string; label: string }
): { value: string; label: string }[] {
  const map = new Map<string, string>();
  for (const r of rows) {
    const { value, label } = pick(r);
    if (!map.has(value)) map.set(value, label);
  }
  return [...map.entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))
    .map(([value, label]) => ({ value, label }));
}
