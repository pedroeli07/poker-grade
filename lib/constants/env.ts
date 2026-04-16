export const nextPublicAppUrl = process.env.NEXT_PUBLIC_APP_URL;
export const nodeEnv = process.env.NODE_ENV;
export const logLevel = process.env.LOG_LEVEL;
export const SHARKSCOPE_NLQ_TIMEZONE = process.env.SHARKSCOPE_NLQ_TIMEZONE ?? "America/Sao_Paulo";
export const sharkScopeNlqTimezone = SHARKSCOPE_NLQ_TIMEZONE;
export const sharkScopeAppName = process.env.SHARKSCOPE_APP_NAME;
export const sharkScopeAppKey = process.env.SHARKSCOPE_APP_KEY;
export const sharkScopePasswordHash = process.env.SHARKSCOPE_PASSWORD_HASH;
export const sharkScopeUsername = process.env.SHARKSCOPE_USERNAME;
export const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
export const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
export const gmailUser = process.env.GMAIL_USER;
export const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
export const databaseUrl = process.env.DATABASE_URL;
export const googleClientId = process.env.GOOGLE_CLIENT_ID;
export const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
export const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
export const upstashRedisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;
export const vercelUrl = process.env.VERCEL_URL;
export const cronSecret = process.env.CRON_SECRET;
export const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

/** Limite de ligações no pool `pg` (Prisma). Default 15. */
export const pgPoolMax = (() => {
  const raw = process.env.PG_POOL_MAX;
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
})();

/** Timeout para obter ligação do pool (ms). Default 15000. */
export const pgConnectionTimeoutMs = (() => {
  const raw = process.env.PG_CONNECTION_TIMEOUT_MS;
  if (!raw) return 15_000;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 15_000;
})();
