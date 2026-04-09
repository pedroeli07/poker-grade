import { describe, expect, it } from "vitest";
import { zodCuidOptional, zodEmail, zodName } from "./primitives";

describe("Schema Primitives", () => {
  describe("zodEmail", () => {
    it("normaliza lower e trim", () => {
      const r1 = zodEmail.safeParse("USER@EXAMPLE.COM");
      expect(r1.success && r1.data).toBe("user@example.com");

      const r2 = zodEmail.safeParse("  USER@EXAMPLE.COM  ");
      expect(r2.success).toBe(true);
      if (r2.success) expect(r2.data).toBe("user@example.com");
    });

    it("recusa formato inválido", () => {
      expect(zodEmail.safeParse("invalid-email").success).toBe(false);
    });
  });

  describe("zodName", () => {
    it("aceita nome não vazio", () => {
      const r = zodName.safeParse("  Pedro Eli  ");
      expect(r.success).toBe(true);
      if (r.success) expect(r.data).toBe("Pedro Eli");
    });

    it("recusa vazio", () => {
      expect(zodName.safeParse("").success).toBe(false);
    });
  });

  describe("zodCuidOptional", () => {
    it("aceita cuid, none e vazio", () => {
      expect(zodCuidOptional.safeParse("clj8k8l7p00003b6pxt6z6l7p").success).toBe(true);
      expect(zodCuidOptional.safeParse("none").success).toBe(true);
      expect(zodCuidOptional.safeParse("").success).toBe(true);
    });

    it("recusa texto que não é cuid nem sentinelas", () => {
      expect(zodCuidOptional.safeParse("not-a-cuid").success).toBe(false);
    });
  });
});
