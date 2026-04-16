import type { Prisma } from "@prisma/client";

function parseOptional(s: string, parser: (v: string) => number): number | null | typeof NaN {
  const t = s.trim();
  if (t === "") return null;
  const n = parser(t.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

export const parseOptionalFloat = (s: string) => parseOptional(s, Number);
export const parseOptionalInt = (s: string) => parseOptional(s, (v) => parseInt(v, 10));

export function parseJson<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

export const toPrismaJson = (v: unknown) => v as Prisma.InputJsonValue;
export const toPrismaJsonOptional = (v: unknown) =>
  v == null ? undefined : (v as Prisma.InputJsonValue);

const NUMERIC_PARSERS: Record<string, (s: string) => number | null | typeof NaN> = {
  float: parseOptionalFloat,
  int: parseOptionalInt,
};

export function parseValue(type: string, v: unknown) {
  if (typeof v !== "string") return v;
  const parse = NUMERIC_PARSERS[type];
  return parse ? parse(v) : v;
}

export function normalizeArray(arr: { item_id: unknown; item_text: unknown }[]) {
  return arr?.map((i) => ({ item_id: i.item_id, item_text: i.item_text }));
}
