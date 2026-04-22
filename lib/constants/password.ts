import type { StrengthLevel } from "@/lib/types/auth";

export const PASSWORD_STRENGTH_STYLES: Record<StrengthLevel, { bar: string; label: string }> = {
  empty: { bar: "bg-zinc-600", label: "text-zinc-500" },
  weak: { bar: "bg-red-500", label: "text-red-400" },
  fair: { bar: "bg-amber-400", label: "text-amber-400" },
  good: { bar: "bg-lime-500", label: "text-lime-400" },
  strong: { bar: "bg-emerald-500", label: "text-emerald-400" },
};

/** Barra de progresso no tema claro (`PasswordStrength` sem `compact`). */
export const PASSWORD_STRENGTH_BAR_BG_MUTED: Record<StrengthLevel, string> = {
  empty: "bg-muted-foreground/30",
  weak: "bg-destructive/80",
  fair: "bg-amber-500",
  good: "bg-emerald-500/80",
  strong: "bg-emerald-500",
};

export const PASSWORD_STRENGTH_LABEL = "Força da senha";

export const PASSWORD_STRENGTH_HINT_COMPACT =
  "Maiúsculas, minúsculas, números e símbolos";

export const PASSWORD_STRENGTH_TRIVIAL_HINT_COMPACT =
  'Evite senhas óbvias como "password" ou "123456".';

export const PASSWORD_STRENGTH_TRIVIAL_HINT_DEFAULT =
  'Evite senhas óbvias como "password" ou sequências comuns.';

export const PASSWORD_STRENGTH_MISSING_PREFIX = "faltam";

export function passwordPolicyTypesHintLine(minLen: number): string {
  return `${PASSWORD_STRENGTH_HINT_COMPACT} (${minLen}+)`;
}

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_POLICY_MESSAGE =
  "A senha deve ter entre 12 e 128 caracteres, incluindo maiúscula, minúscula, número e caractere especial.";

/** Senhas triviais — só o valor inteiro (evita bloquear "Administrador123!@#"). */
export const TRIVIAL_PASSWORD_EXACT_LIST = [
  "password",
  "password123",
  "senha",
  "123456",
  "12345678",
  "qwerty",
  "admin",
  "letmein",
  "welcome",
] as const;
