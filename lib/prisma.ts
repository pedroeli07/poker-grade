// lib/prisma.ts — Prisma 7 exige adapter (pg) ou accelerateUrl para engine "client".
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PoolConfig } from "pg";
import { createLogger } from "./logger";
import { pgPoolMax, pgConnectionTimeoutMs } from "./constants/env";

const prismaLog = createLogger("prisma");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Configuração explícita do pool interno do driver `pg` (via PrismaPg).
 * Evita ligações implícitas sem limite claro e timeouts excessivos sob carga em dev.
 *
 * Env opcional: PG_POOL_MAX (default 15), PG_CONNECTION_TIMEOUT_MS (default 15000).
 */
function getPoolConfig(): PoolConfig {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL não está definida.");
  }

  const max = Math.min(32, Math.max(2, pgPoolMax ?? 15));
  const connectionTimeoutMillis = pgConnectionTimeoutMs;

  return {
    connectionString: url,
    max,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis,
  };
}

function createPrismaClient(): PrismaClient {
  // Dois `@types/pg` no árvore (adapter vs raiz) — alinhar em runtime; tipos divergem.
  const poolConfig = getPoolConfig() as ConstructorParameters<typeof PrismaPg>[0];
  const adapter = new PrismaPg(poolConfig, {
    onPoolError: (err) => {
      prismaLog.error("Erro no pool PostgreSQL", err instanceof Error ? err : undefined, {
        message: err.message,
      });
    },
  });

  return new PrismaClient({
    adapter,
    log: [],  // SQL query logs disabled — too noisy; use application-level logging
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

prismaLog.info("PrismaClient pronto", {
  env: process.env.NODE_ENV,
});
