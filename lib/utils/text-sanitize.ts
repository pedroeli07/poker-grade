import { CTRL } from "@/lib/constants";

export function sanitizeText(input: string, maxLen: number): string {
  const s = input.replace(CTRL, "").trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

export function sanitizeOptional(input: string | null | undefined, maxLen: number): string | null {
  if (input == null || input === "") return null;
  const s = sanitizeText(input, maxLen);
  return s === "" ? null : s;
}
