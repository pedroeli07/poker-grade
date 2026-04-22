"use server";

import { limitDashboardMutation } from "@/lib/rate-limit";

export async function notificationMutationGate(session: { userId: string }) {
  const rl = await limitDashboardMutation(session.userId);
  if (!rl.ok) return { ok: false as const, error: `Aguarde ${rl.retryAfterSec}s.` };
  return { ok: true as const };
}
