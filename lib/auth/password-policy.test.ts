import { describe, expect, it } from "vitest";
import {
  getPasswordPolicyGaps,
  getPasswordStrength,
  isTrivialPassword,
  passwordMeetsPolicy,
  PASSWORD_MIN_LENGTH,
} from "./password-policy";

describe("passwordMeetsPolicy", () => {
  it("aceita senha forte típica", () => {
    expect(passwordMeetsPolicy("Lucuzu123456!")).toBe(true);
  });

  it("recusa sem símbolo", () => {
    expect(passwordMeetsPolicy("Lucuzu123456")).toBe(false);
  });

  it("recusa curta", () => {
    expect(passwordMeetsPolicy("Lu1!Aa")).toBe(false);
  });

  it("recusa trivial exata", () => {
    expect(passwordMeetsPolicy("admin")).toBe(false);
  });
});

describe("getPasswordStrength — progressão ao digitar", () => {
  it('"Lu" é fraca e percent > 0', () => {
    const s = getPasswordStrength("Lu");
    expect(s.level).toBe("weak");
    expect(s.percent).toBeGreaterThan(0);
  });

  it('"Lucuzu123" tende a média ou boa sem cumprir política', () => {
    const s = getPasswordStrength("Lucuzu123");
    expect(s.level).not.toBe("empty");
    expect(s.level).not.toBe("strong");
    expect(["fair", "good"]).toContain(s.level);
    expect(s.percent).toBeGreaterThanOrEqual(30);
  });

  it("vazia fica em empty", () => {
    const s = getPasswordStrength("");
    expect(s.level).toBe("empty");
    expect(s.percent).toBe(0);
  });

  it("política completa = forte 100%", () => {
    const s = getPasswordStrength("Aa1!" + "b".repeat(PASSWORD_MIN_LENGTH));
    expect(s.level).toBe("strong");
    expect(s.percent).toBe(100);
  });
});

describe("getPasswordPolicyGaps", () => {
  it("lista vários requisitos em falta", () => {
    const g = getPasswordPolicyGaps("ab");
    expect(g.some((x) => x.includes(String(PASSWORD_MIN_LENGTH)))).toBe(true);
    expect(g).toContain("maiúscula");
    expect(g).toContain("número");
    expect(g).toContain("símbolo");
  });
});

describe("isTrivialPassword", () => {
  it("não bloqueia por prefixo", () => {
    expect(isTrivialPassword("Administrador123!@#")).toBe(false);
  });
});
