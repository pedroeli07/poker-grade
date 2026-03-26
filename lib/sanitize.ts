const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Normaliza texto antes de persistir: trim, remove controles, limita tamanho.
 */
export function sanitizeText(input: string, maxLen: number): string {
  let s = input.replace(CTRL, "").trim();
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

export function sanitizeOptional(
  input: string | null | undefined,
  maxLen: number
): string | null {
  if (input == null || input === "") return null;
  const s = sanitizeText(input, maxLen);
  return s === "" ? null : s;
}
