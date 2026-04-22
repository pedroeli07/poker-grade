import { limitDashboardMutation } from "@/lib/rate-limit";
import { requireSession } from "@/lib/auth/session";
import { assertStaffSession } from "@/lib/queries/db/team/staff-guard";
import { fail } from "@/lib/constants/query-result";
import { ErrorTypes } from "@/lib/types/primitives";
import type { Ok, Err } from "@/lib/types/primitives";
import type { AppSession } from "@/lib/types/auth";
import { teamQueriesLog } from "@/lib/constants/queries-mutations";

export async function runTeamMutation(
  fn: (session: AppSession) => Promise<void>,
): Promise<Ok | Err> {
  const session = await requireSession();
  try {
    assertStaffSession(session);
  } catch {
    return fail(ErrorTypes.FORBIDDEN);
  }
  const rl = await limitDashboardMutation(session.userId);
  if (!rl.ok) return fail(`Muitas alterações. Aguarde ${rl.retryAfterSec}s.`);
  try {
    await fn(session);
    return { ok: true };
  } catch (e) {
    teamQueriesLog.error("team mutation", e instanceof Error ? e : undefined);
    return fail(e instanceof Error ? e.message : ErrorTypes.OPERATION_FAILED);
  }
}
