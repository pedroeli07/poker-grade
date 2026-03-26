import { createLogger } from "@/lib/logger";

const log = createLogger("api.origin");

function normalizeOrigin(o: string): string {
  return o.replace(/\/$/, "");
}

/** Aceita localhost e 127.0.0.1 na mesma porta (evita 403 ao alternar no browser). */
function devLocalhostEquivalent(a: string, b: string): boolean {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    if (ua.protocol !== ub.protocol || ua.port !== ub.port) return false;
    const hosts = new Set([ua.hostname, ub.hostname]);
    return (
      hosts.has("localhost") &&
      hosts.has("127.0.0.1")
    );
  } catch {
    return false;
  }
}

/**
 * Verifica Origin em mutações (Route Handlers).
 * Sem NEXT_PUBLIC_APP_URL: não aplica checagem estrita.
 * Em desenvolvimento: aceita variantes localhost / 127.0.0.1 com mesma porta.
 */
export function assertSameOrigin(request: Request): void {
  const allowedRaw = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!allowedRaw) {
    log.debug("NEXT_PUBLIC_APP_URL não definido — pulando checagem estrita de Origin");
    return;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const norm = normalizeOrigin(origin);
  const allowed = normalizeOrigin(allowedRaw);

  if (norm === allowed) return;

  if (
    process.env.NODE_ENV === "development" &&
    devLocalhostEquivalent(norm, allowed)
  ) {
    log.debug("Origin dev localhost equivalente aceito", { origin: norm, allowed });
    return;
  }

  log.warn("Origin rejeitado", { origin: norm, allowed });
  throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
