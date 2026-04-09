import { vi } from "vitest";

process.env.DATABASE_URL ??= "postgresql://vitest:vitest@127.0.0.1:5432/vitest";
process.env.SHARKSCOPE_PASSWORD_HASH ??= "vitest_pwd_hash";
process.env.SHARKSCOPE_APP_KEY ??= "vitest_app_key";

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

vi.mock("@/lib/logger", () => {
  const noop = vi.fn();
  return {
    createLogger: vi.fn(() => ({
      info: noop,
      warn: noop,
      error: noop,
      debug: noop,
      success: noop,
      table: noop,
      sep: noop,
    })),
    log: { info: noop, warn: noop, error: noop, debug: noop, success: noop, table: noop, sep: noop },
  };
});
