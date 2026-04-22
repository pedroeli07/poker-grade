"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { notificationIdSchema } from "@/lib/constants/notification";
import { notificationsQueriesLog } from "@/lib/constants/queries-mutations";
import { ErrorTypes } from "@/lib/types/primitives";
import { notificationMutationGate } from "./mutation-guard";

export async function markNotificationRead(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const gate = await notificationMutationGate(session);
  if (!gate.ok) return gate;

  const parsed = notificationIdSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: ErrorTypes.INVALID_DATA };

  await prisma.notification.updateMany({
    where: { id: parsed.data, userId: session.userId },
    data: { read: true, readAt: new Date() },
  });
  revalidatePath("/admin/notificacoes");
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const gate = await notificationMutationGate(session);
  if (!gate.ok) return gate;

  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true, readAt: new Date() },
  });
  notificationsQueriesLog.info("Todas marcadas como lidas", { userId: session.userId });
  revalidatePath("/admin/notificacoes");
  return { ok: true };
}
