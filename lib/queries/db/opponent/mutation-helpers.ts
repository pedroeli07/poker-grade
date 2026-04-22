"use server";

import { requireSession } from "@/lib/auth/session";
import { limitDashboardMutation } from "@/lib/rate-limit";
import { fail } from "@/lib/constants/query-result";
import { ErrorTypes } from "@/lib/types/primitives";
import type { Ok, Err } from "@/lib/types/primitives";
import type { AppSession } from "@/lib/types/auth";
import { createLogger } from "@/lib/logger";
import { revalidateOpponents } from "@/lib/constants/revalidate-app";

const log = createLogger("opponents.queries");

export async function runOpponentMutation(
  guard: (s: AppSession) => void,
  fn: (s: AppSession) => Promise<string[] | void>
): Promise<Ok | Err> {
  const session = await requireSession();
  try {
    guard(session);
  } catch (e) {
    return fail(e instanceof Error ? e.message : ErrorTypes.FORBIDDEN);
  }
  const rl = await limitDashboardMutation(session.userId);
  if (!rl.ok) return fail(`Muitas alterações. Aguarde ${rl.retryAfterSec}s.`);
  try {
    const extra = await fn(session);
    revalidateOpponents(...(extra ?? []));
    return { ok: true };
  } catch (e) {
    log.error("opponent mutation falhou", e instanceof Error ? e : undefined);
    return fail(e instanceof Error ? e.message : ErrorTypes.OPERATION_FAILED);
  }
}
