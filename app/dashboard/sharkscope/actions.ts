"use server";

import { requireSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils";
import { runDailySyncSharkScope } from "@/lib/sharkscope/run-daily-sync";
import { ErrorTypes } from "@/lib/types";

export async function syncSharkScopeManualAction() {
  const session = await requireSession();
  if (!canWriteOperations(session)) throw new Error(ErrorTypes.UNAUTHORIZED);

  try {
    const data = await runDailySyncSharkScope(true);
    return {
      success: true,
      processed: data.processed,
      errors: data.errors,
      sharkHttpCalls: data.sharkHttpCalls,
      remainingSearches: data.remainingSearches,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR;
    if (msg === ErrorTypes.SHARK_SYNC_CREDENTIALS_NOT_CONFIGURED) {
      return { success: false, error: msg };
    }
    return {
      success: false,
      error: msg,
    };
  }
}
