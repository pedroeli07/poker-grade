import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createLogger } from "@/lib/logger";

const log = createLogger("rate-limit");

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const memoryBuckets = new Map<string, { count: number; reset: number }>();

function memoryLimit(
  key: string,
  max: number,
  windowMs: number
): { success: boolean; reset: number } {
  const now = Date.now();
  const b = memoryBuckets.get(key);
  if (!b || now > b.reset) {
    memoryBuckets.set(key, { count: 1, reset: now + windowMs });
    return { success: true, reset: now + windowMs };
  }
  if (b.count >= max) {
    return { success: false, reset: b.reset };
  }
  b.count += 1;
  return { success: true, reset: b.reset };
}

/** Login: 5 req / 15 min por IP */
export async function limitLogin(ip: string): Promise<{
  ok: boolean;
  retryAfterSec: number;
}> {
  const redis = getRedis();
  if (redis) {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: false,
      prefix: "rl:login",
    });
    const { success, reset } = await rl.limit(ip);
    return {
      ok: success,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  }
  log.warn("Upstash ausente — rate limit em memória (não distribuído)");
  const { success, reset } = memoryLimit(`login:${ip}`, 5, 15 * 60_000);
  return {
    ok: success,
    retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}

/** Registro: 5 tentativas / hora por IP */
export async function limitRegister(ip: string): Promise<{
  ok: boolean;
  retryAfterSec: number;
}> {
  const redis = getRedis();
  if (redis) {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: false,
      prefix: "rl:register",
    });
    const { success, reset } = await rl.limit(ip);
    return {
      ok: success,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  }
  const { success, reset } = memoryLimit(`register:${ip}`, 5, 60 * 60_000);
  return {
    ok: success,
    retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}

/** Rotas públicas gerais: 100 req / min por IP */
export async function limitPublic(ip: string): Promise<{
  ok: boolean;
  retryAfterSec: number;
}> {
  const redis = getRedis();
  if (redis) {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: false,
      prefix: "rl:public",
    });
    const { success, reset } = await rl.limit(ip);
    return {
      ok: success,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  }
  const { success, reset } = memoryLimit(`pub:${ip}`, 100, 60_000);
  return {
    ok: success,
    retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}
