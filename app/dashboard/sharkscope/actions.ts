"use server";

import { requireSession } from "@/lib/auth/session";
import { canWriteOperations, getAppBaseUrl } from "@/lib/utils";
import { cronSecret } from "@/lib/constants";
import { ErrorTypes } from "@/lib/types";

export async function syncSharkScopeManualAction() {
  const session = await requireSession();
  if (!canWriteOperations(session)) throw new Error(ErrorTypes.UNAUTHORIZED);

  const appUrl = getAppBaseUrl() || "http://localhost:3000";

  if (!cronSecret) {
    return { success: false, error: ErrorTypes.CRON_SECRET_NOT_CONFIGURED };
  }

  try {
    const response = await fetch(`${appUrl}/api/cron/daily-sync`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Erro HTTP ${response.status}: ${text}` };
    }

    const data = await response.json();
    return { success: true, processed: data.processed, errors: data.errors };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR,
    };
  }
}
