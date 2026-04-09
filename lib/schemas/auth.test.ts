import { describe, expect, it } from "vitest";
import { loginBodySchema, registerBodySchema } from "./auth";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/password-policy";

const strongPassword = "Aa1!" + "b".repeat(PASSWORD_MIN_LENGTH);

describe("loginBodySchema", () => {
  it("aceita email e senha válidos", () => {
    const result = loginBodySchema.safeParse({
      email: "test@example.com",
      password: strongPassword,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });

  it("normaliza email com trim e lower (após validação de formato)", () => {
    const result = loginBodySchema.safeParse({
      email: "User@Example.com",
      password: "x",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("user@example.com");
  });

  it("recusa email inválido", () => {
    const result = loginBodySchema.safeParse({
      email: "not-an-email",
      password: "x",
    });
    expect(result.success).toBe(false);
  });

  it("recusa senha vazia", () => {
    const result = loginBodySchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerBodySchema", () => {
  const base = {
    email: "test@example.com",
    code: "123456" as const,
  };

  it("falha se senhas não coincidem", () => {
    const result = registerBodySchema.safeParse({
      ...base,
      password: strongPassword,
      confirmPassword: strongPassword + "x",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("coincidem"))).toBe(true);
    }
  });

  it("aceita registo com política e código", () => {
    const result = registerBodySchema.safeParse({
      ...base,
      password: strongPassword,
      confirmPassword: strongPassword,
    });
    expect(result.success).toBe(true);
  });

  it("recusa senha fraca ainda que coincida", () => {
    const weak = "short";
    const result = registerBodySchema.safeParse({
      ...base,
      password: weak,
      confirmPassword: weak,
    });
    expect(result.success).toBe(false);
  });
});
