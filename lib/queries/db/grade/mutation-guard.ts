import { requireSession } from "@/lib/auth/session";
import { assertCanManageGrades } from "@/lib/utils/auth-permissions";
import { limitGradesMutation } from "@/lib/rate-limit";
import { revalidateGrades } from "@/lib/constants/revalidate-app";
import { fail } from "@/lib/constants/query-result";
import { ErrorTypes, Err, Ok } from "@/lib/types/primitives";
import type { AppSession } from "@/lib/types/auth";
import type { GradeMutationBody } from "./mutation-guard.types";

export async function withMutation(
  guard: (s: AppSession) => void,
  fn: GradeMutationBody
): Promise<Ok | Err> {
  const session = await requireSession();
  guard(session);
  const rl = await limitGradesMutation(session.userId);
  if (!rl.ok) return fail(`Muitas alterações. Aguarde ${rl.retryAfterSec}s e tente novamente.`);
  try {
    revalidateGrades(...((await fn(session)) ?? []));
    return { ok: true };
  } catch (e) {
    return fail(e instanceof Error ? e.message : ErrorTypes.OPERATION_FAILED);
  }
}

export const adminMutation = (fn: GradeMutationBody) => withMutation(assertCanManageGrades, fn);
