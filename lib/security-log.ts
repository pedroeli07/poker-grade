import { createLogger } from "@/lib/logger";

const sec = createLogger("security");

/** Eventos de segurança — nunca incluir senhas, tokens completos ou PII sensível. */
export function logLoginFailure(ip: string, reason: string) {
  sec.warn("login_failed", { ip: hashIp(ip), reason });
}

export function logLoginSuccess(userId: string) {
  sec.info("login_ok", { userId });
}

export function logLogout(userId: string) {
  sec.info("logout", { userId });
}

export function logRateLimited(route: string, ip: string) {
  sec.warn("rate_limited", { route, ip: hashIp(ip) });
}

export function logForbidden(action: string, userId?: string) {
  sec.warn("forbidden", { action, userId });
}

export function logValidationFailure(scope: string) {
  sec.warn("validation_failed", { scope });
}

function hashIp(ip: string): string {
  if (ip.length <= 8) return "***";
  return `${ip.slice(0, 4)}…${ip.slice(-4)}`;
}
