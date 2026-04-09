import { parseOptionalFloat, parseOptionalInt } from "./parse";

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
