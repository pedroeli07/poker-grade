import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createLogger } from "@/lib/logger";
import { redisToken, redisUrl } from "./constants";

const log = createLogger("rate-limit");

function getRedis(): Redis | null {
  if (!redisUrl || !redisToken) return null;
  return new Redis({ url: redisUrl, token: redisToken });
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

/** Mutações em grades (import, CRUD): 40 / min por usuário autenticado */
export async function limitGradesMutation(userId: string): Promise<{
  ok: boolean;
  retryAfterSec: number;
}> {
  const redis = getRedis();
  if (redis) {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(40, "1 m"),
      analytics: false,
      prefix: "rl:grades:mut",
    });
    const { success, reset } = await rl.limit(userId);
    return {
      ok: success,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  }
  const { success, reset } = memoryLimit(`grades:mut:${userId}`, 40, 60_000);
  return {
    ok: success,
    retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}

/** Leituras agregadas de grades (lista / detalhe via action): 120 / min por usuário */
export async function limitGradesRead(userId: string): Promise<{
  ok: boolean;
  retryAfterSec: number;
}> {
  const redis = getRedis();
  if (redis) {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "1 m"),
      analytics: false,
      prefix: "rl:grades:read",
    });
    const { success, reset } = await rl.limit(userId);
    return {
      ok: success,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  }
  const { success, reset } = memoryLimit(`grades:read:${userId}`, 120, 60_000);
  return {
    ok: success,
    retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}

/** Lista / refetch de importações (server action): 120 / min por usuário */
export async function limitImportsRead(userId: string): Promise<{
  ok: boolean;
  retryAfterSec: number;
}> {
  const redis = getRedis();
  if (redis) {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "1 m"),
      analytics: false,
      prefix: "rl:imports:read",
    });
    const { success, reset } = await rl.limit(userId);
    return {
      ok: success,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  }
  const { success, reset } = memoryLimit(`imports:read:${userId}`, 120, 60_000);
  return {
    ok: success,
    retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}

/** Upload Excel de torneios: 12 / hora por usuário */
export async function limitImportsUpload(userId: string): Promise<{
  ok: boolean;
  retryAfterSec: number;
}> {
  const redis = getRedis();
  if (redis) {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(12, "1 h"),
      analytics: false,
      prefix: "rl:imports:upload",
    });
    const { success, reset } = await rl.limit(userId);
    return {
      ok: success,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  }
  const { success, reset } = memoryLimit(`imports:up:${userId}`, 12, 60 * 60_000);
  return {
    ok: success,
    retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}

/** Exclusão de importações: 40 / min por usuário */
export async function limitImportsDelete(userId: string): Promise<{
  ok: boolean;
  retryAfterSec: number;
}> {
  const redis = getRedis();
  if (redis) {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(40, "1 m"),
      analytics: false,
      prefix: "rl:imports:del",
    });
    const { success, reset } = await rl.limit(userId);
    return {
      ok: success,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  }
  const { success, reset } = memoryLimit(`imports:del:${userId}`, 40, 60_000);
  return {
    ok: success,
    retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}

/** Leituras de dashboard (listas via server action): 120 / min por usuário */
export async function limitDashboardRead(userId: string): Promise<{
  ok: boolean;
  retryAfterSec: number;
}> {
  const redis = getRedis();
  if (redis) {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "1 m"),
      analytics: false,
      prefix: "rl:dash:read",
    });
    const { success, reset } = await rl.limit(userId);
    return {
      ok: success,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  }
  const { success, reset } = memoryLimit(`dash:read:${userId}`, 120, 60_000);
  return {
    ok: success,
    retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}

/** Mutações gerais do dashboard (players, targets, notificações, review): 60 / min */
export async function limitDashboardMutation(userId: string): Promise<{
  ok: boolean;
  retryAfterSec: number;
}> {
  const redis = getRedis();
  if (redis) {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: false,
      prefix: "rl:dash:mut",
    });
    const { success, reset } = await rl.limit(userId);
    return {
      ok: success,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  }
  const { success, reset } = memoryLimit(`dash:mut:${userId}`, 60, 60_000);
  return {
    ok: success,
    retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}

type SlidingWindow = `${number} m` | `${number} h`;

function createUserLimiter(
  prefix: string,
  max: number,
  window: SlidingWindow,
  memoryWindowMs: number
) {
  return async (userId: string): Promise<{
    ok: boolean;
    retryAfterSec: number;
  }> => {
    const redis = getRedis();
    if (redis) {
      const rl = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(max, window),
        analytics: false,
        prefix: `rl:${prefix}`,
      });
      const { success, reset } = await rl.limit(userId);
      return {
        ok: success,
        retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
      };
    }
    log.warn("Upstash ausente — rate limit em memória (não distribuído)");
    const { success, reset } = memoryLimit(`${prefix}:${userId}`, max, memoryWindowMs);
    return {
      ok: success,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  };
}

/** Leituras SharkScope (proxy cache, lista de nicks, GET alertas). */
export const limitSharkscopeRead = createUserLimiter("shark:read", 90, "1 m", 60_000);

/** Buscas que consomem cota SharkScope (NLQ, scouting-search). */
export const limitSharkscopeSearch = createUserLimiter("shark:search", 15, "1 m", 60_000);

/** Mutações SharkScope (nicks, acknowledge, scouting save/delete). */
export const limitSharkscopeMutation = createUserLimiter("shark:mut", 45, "1 m", 60_000);
