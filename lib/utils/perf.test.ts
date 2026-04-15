import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { isPerfLoggingEnabled, logPerf, timed, withPerf } from "./perf";

describe("perf utils", () => {
  describe("isPerfLoggingEnabled", () => {
    it("em produção só ativa com LOG_PERF=1", () => {
      const prev = { NODE_ENV: process.env.NODE_ENV, LOG_PERF: process.env.LOG_PERF };
      try {
        process.env.NODE_ENV = "production";
        delete process.env.LOG_PERF;
        expect(isPerfLoggingEnabled()).toBe(false);
        process.env.LOG_PERF = "1";
        expect(isPerfLoggingEnabled()).toBe(true);
      } finally {
        process.env.NODE_ENV = prev.NODE_ENV;
        if (prev.LOG_PERF === undefined) delete process.env.LOG_PERF;
        else process.env.LOG_PERF = prev.LOG_PERF;
      }
    });

    it("em desenvolvimento desliga com LOG_PERF=0", () => {
      const prev = { NODE_ENV: process.env.NODE_ENV, LOG_PERF: process.env.LOG_PERF };
      try {
        process.env.NODE_ENV = "development";
        process.env.LOG_PERF = "0";
        expect(isPerfLoggingEnabled()).toBe(false);
      } finally {
        process.env.NODE_ENV = prev.NODE_ENV;
        if (prev.LOG_PERF === undefined) delete process.env.LOG_PERF;
        else process.env.LOG_PERF = prev.LOG_PERF;
      }
    });

    it("em desenvolvimento default activo sem LOG_PERF", () => {
      const prev = { NODE_ENV: process.env.NODE_ENV, LOG_PERF: process.env.LOG_PERF };
      try {
        process.env.NODE_ENV = "development";
        delete process.env.LOG_PERF;
        expect(isPerfLoggingEnabled()).toBe(true);
      } finally {
        process.env.NODE_ENV = prev.NODE_ENV;
        if (prev.LOG_PERF === undefined) delete process.env.LOG_PERF;
        else process.env.LOG_PERF = prev.LOG_PERF;
      }
    });
  });

  describe("logPerf / withPerf / timed", () => {
    let spy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      spy = vi.spyOn(console, "info").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("logPerf não escreve quando LOG_PERF=0", () => {
      const prev = { NODE_ENV: process.env.NODE_ENV, LOG_PERF: process.env.LOG_PERF };
      try {
        process.env.NODE_ENV = "development";
        process.env.LOG_PERF = "0";
        logPerf("a", "b", performance.now());
        expect(spy).not.toHaveBeenCalled();
      } finally {
        process.env.NODE_ENV = prev.NODE_ENV;
        if (prev.LOG_PERF === undefined) delete process.env.LOG_PERF;
        else process.env.LOG_PERF = prev.LOG_PERF;
      }
    });

    it("withPerf executa a função e retorna o valor", async () => {
      const prev = { NODE_ENV: process.env.NODE_ENV, LOG_PERF: process.env.LOG_PERF };
      try {
        process.env.NODE_ENV = "development";
        process.env.LOG_PERF = "1";
        const r = await withPerf("x", "y", async () => "ok");
        expect(r).toBe("ok");
        expect(spy).toHaveBeenCalled();
      } finally {
        process.env.NODE_ENV = prev.NODE_ENV;
        if (prev.LOG_PERF === undefined) delete process.env.LOG_PERF;
        else process.env.LOG_PERF = prev.LOG_PERF;
      }
    });

    it("timed preserva resultado e rejeição da Promise", async () => {
      const prev = { NODE_ENV: process.env.NODE_ENV, LOG_PERF: process.env.LOG_PERF };
      try {
        process.env.NODE_ENV = "development";
        process.env.LOG_PERF = "1";
        await expect(timed("t", "a", Promise.resolve(7))).resolves.toBe(7);
        await expect(
          timed("t", "b", Promise.reject(new Error("e")))
        ).rejects.toThrow("e");
      } finally {
        process.env.NODE_ENV = prev.NODE_ENV;
        if (prev.LOG_PERF === undefined) delete process.env.LOG_PERF;
        else process.env.LOG_PERF = prev.LOG_PERF;
      }
    });
  });
});
