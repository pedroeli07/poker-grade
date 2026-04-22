"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireSession } from "@/lib/auth/session";
import { importsQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidateImports } from "@/lib/constants/revalidate-app";
import { fail } from "@/lib/constants/query-result";
import { ErrorTypes } from "@/lib/types/primitives";
import type { Err, Ok } from "@/lib/types/primitives";
import { AppSession } from "@/lib/types/auth";
import { limitImportsDelete } from "@/lib/rate-limit";

type RateLimit = typeof limitImportsDelete;

export async function withImportMutation(
  guard: (s: AppSession) => void | boolean,
  rateLimit: RateLimit,
  fn: (s: AppSession) => Promise<string[] | void>
): Promise<Ok | Err> {
  const session = await requireSession();
  const allowed = guard(session);
  if (allowed === false) return fail(ErrorTypes.FORBIDDEN);

  const rl = await rateLimit(session.userId);
  if (!rl.ok) return fail(`Muitas requisições. Aguarde ${rl.retryAfterSec}s.`);
  try {
    const extra = await fn(session);
    revalidateImports(...(extra ?? []));
    return { ok: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    importsQueriesLog.error("Erro na mutation de import", err instanceof Error ? err : undefined);
    return fail(err instanceof Error ? err.message : ErrorTypes.OPERATION_FAILED);
  }
}
