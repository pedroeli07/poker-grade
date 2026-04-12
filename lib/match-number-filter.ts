import { NumberFilterValue } from "@/lib/number-filter";

export function matchNumberFilter(v: number | null, f: NumberFilterValue | null): boolean {
  if (!f) return true;
  if (v === null) return false;
  if (f.op === "in" && f.values && f.values.length > 0) return f.values.includes(v);
  if (f.op === "eq" && v === f.min) return true;
  if (f.op === "gt" && v > (f.min ?? 0)) return true;
  if (f.op === "lt" && v < (f.min ?? 0)) return true;
  if (f.op === "gte" && v >= (f.min ?? 0)) return true;
  if (f.op === "lte" && v <= (f.min ?? 0)) return true;
  if (f.op === "between" && f.min !== null && f.max !== null && v >= f.min && v <= f.max) return true;
  if (f.op === "between" && f.min !== null && f.max === null && v >= f.min) return true;
  if (f.op === "between" && f.min === null && f.max !== null && v <= f.max) return true;
  return false;
}

export function getUniqueValues<T>(arr: T[], getter: (item: T) => number | null): number[] {
  return [...new Set(arr.map(getter).filter((v): v is number => v !== null))];
}