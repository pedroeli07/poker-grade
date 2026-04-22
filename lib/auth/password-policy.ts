/**
 * Regras alinhadas ao registo (servidor + feedback em tempo real no cliente).
 */

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  TRIVIAL_PASSWORD_EXACT_LIST,
} from "@/lib/constants/password";
import type { PasswordChecks, StrengthLevel } from "@/lib/types/auth";

const TRIVIAL_EXACT = new Set(
  TRIVIAL_PASSWORD_EXACT_LIST.map((s) => s.toLowerCase())
);

export function isTrivialPassword(password: string): boolean {
  return TRIVIAL_EXACT.has(password.trim().toLowerCase());
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    maxLength: password.length <= PASSWORD_MAX_LENGTH,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

/** Critérios obrigatórios para aceitar no registo. */
export function passwordMeetsPolicy(password: string): boolean {
  const c = getPasswordChecks(password);
  return (
    c.minLength &&
    c.maxLength &&
    c.lower &&
    c.upper &&
    c.digit &&
    c.special &&
    !isTrivialPassword(password)
  );
}

/** Requisitos em falta para o registo (textos curtos para UI). */
export function getPasswordPolicyGaps(password: string): string[] {
  const c = getPasswordChecks(password);
  const gaps: string[] = [];
  if (!c.minLength) gaps.push(`${PASSWORD_MIN_LENGTH}+ caracteres`);
  if (!c.lower) gaps.push("minúscula");
  if (!c.upper) gaps.push("maiúscula");
  if (!c.digit) gaps.push("número");
  if (!c.special) gaps.push("símbolo");
  if (password.length > 0 && isTrivialPassword(password)) {
    gaps.push("evite senhas óbvias");
  }
  return gaps;
}

export function getPasswordStrength(password: string): {
  level: StrengthLevel;
  percent: number;
  checks: PasswordChecks;
  trivialRejected: boolean;
} {
  const checks = getPasswordChecks(password);
  const trivialRejected =
    password.length > 0 && isTrivialPassword(password);

  if (!password) {
    return { level: "empty", percent: 0, checks, trivialRejected: false };
  }

  if (passwordMeetsPolicy(password)) {
    return {
      level: "strong",
      percent: 100,
      checks,
      trivialRejected: false,
    };
  }

  const core = [
    checks.minLength,
    checks.lower,
    checks.upper,
    checks.digit,
    checks.special,
  ];
  const passed = core.filter(Boolean).length;
  const len = password.length;

  if (trivialRejected || !checks.maxLength) {
    return {
      level: "weak",
      percent: Math.min(95, Math.max(10, Math.round((passed / 5) * 40))),
      checks,
      trivialRejected,
    };
  }

  /** Comprimento + critérios: barra reage logo ao primeiro caractere. */
  const lengthRatio = Math.min(len / PASSWORD_MIN_LENGTH, 1);
  const lengthScore = lengthRatio * 32;
  const ruleScore = (passed / 5) * 68;
  const percent = Math.min(99, Math.round(lengthScore + ruleScore));

  let level: StrengthLevel;
  if (percent < 34) {
    level = "weak";
  } else if (percent < 58) {
    level = "fair";
  } else {
    level = "good";
  }

  return { level, percent, checks, trivialRejected };
}
