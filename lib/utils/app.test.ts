import { describe, it, expect } from "vitest";
import { UserRole } from "@prisma/client";
import { 
  canViewPlayer, 
  sanitizeText, 
  sanitizeOptional, 
  normalizeAuthEmail,
  generateOTP,
  roiSeverity
} from "./app";

describe("Core Utilities (app.ts)", () => {
  describe("canViewPlayer", () => {
    const player = { id: "p1", coachId: "c1", driId: "d1" };

    it("should allow ADMIN, MANAGER, and VIEWER roles", () => {
      expect(canViewPlayer({ role: UserRole.ADMIN }, player)).toBe(true);
      expect(canViewPlayer({ role: UserRole.MANAGER }, player)).toBe(true);
      expect(canViewPlayer({ role: UserRole.VIEWER }, player)).toBe(true);
    });

    it("should allow COACH if they are the coach or DRI of the player", () => {
      expect(canViewPlayer({ role: UserRole.COACH, coachId: "c1" }, player)).toBe(true);
      expect(canViewPlayer({ role: UserRole.COACH, coachId: "d1" }, player)).toBe(true);
      expect(canViewPlayer({ role: UserRole.COACH, coachId: "other" }, player)).toBe(false);
    });

    it("should allow PLAYER if they are viewing their own record", () => {
      expect(canViewPlayer({ role: UserRole.PLAYER, playerId: "p1" }, player)).toBe(true);
      expect(canViewPlayer({ role: UserRole.PLAYER, playerId: "p2" }, player)).toBe(false);
    });
  });

  describe("Sanitization", () => {
    it("sanitizeText should trim and limit length", () => {
      expect(sanitizeText("  Hello World  ", 5)).toBe("Hello");
      expect(sanitizeText("NoChange", 20)).toBe("NoChange");
    });

    it("sanitizeOptional should handle null, empty and trim", () => {
      expect(sanitizeOptional(null, 10)).toBe(null);
      expect(sanitizeOptional("", 10)).toBe(null);
      expect(sanitizeOptional("  Test  ", 10)).toBe("Test");
    });
  });

  describe("Auth Utilities", () => {
    it("normalizeAuthEmail should lowercase and trim", () => {
      expect(normalizeAuthEmail(" USER@Example.com  ")).toBe("user@example.com");
    });

    it("generateOTP should return a 6-digit string", () => {
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
    });
  });

  describe("Severity Calculation", () => {
    it("roiSeverity should return correct levels", () => {
      expect(roiSeverity(-50)).toBe("red");
      expect(roiSeverity(-30)).toBe("yellow");
      expect(roiSeverity(10)).toBe("green");
    });
  });
});
