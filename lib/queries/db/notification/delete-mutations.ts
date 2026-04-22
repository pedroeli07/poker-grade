"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { notificationIdSchema } from "@/lib/constants/notification";
import { notificationIdsDeleteSchema } from "@/lib/schemas/review-import";
import { notificationsQueriesLog } from "@/lib/constants/queries-mutations";
import { ErrorTypes } from "@/lib/types/primitives";
import { notificationMutationGate } from "./mutation-guard";

export async function deleteNotification(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const gate = await notificationMutationGate(session);
  if (!gate.ok) return gate;

  const parsed = notificationIdSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: ErrorTypes.INVALID_DATA };

  await prisma.notification.deleteMany({
    where: { id: parsed.data, userId: session.userId },
  });
  revalidatePath("/admin/notificacoes");
  return { ok: true };
}

export async function deleteSelectedNotifications(
  ids: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ids.length) return { ok: false, error: "Nada selecionado." };
  const session = await requireSession();
  const gate = await notificationMutationGate(session);
  if (!gate.ok) return gate;

  const parsed = notificationIdsDeleteSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, error: ErrorTypes.INVALID_DATA };

  await prisma.notification.deleteMany({
    where: { id: { in: parsed.data }, userId: session.userId },
  });
  notificationsQueriesLog.info("Excluídas", { count: parsed.data.length });
  revalidatePath("/admin/notificacoes");
  return { ok: true };
}
