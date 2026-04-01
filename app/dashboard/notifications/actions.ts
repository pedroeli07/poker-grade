"use server";

import type { Notification } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import { limitDashboardMutation, limitDashboardRead } from "@/lib/rate-limit";
import {
  notificationIdsDeleteSchema,
  notificationsPageParamsSchema,
} from "@/lib/validation/schemas";
import { z } from "zod";

const log = createLogger("notifications.actions");

const PAGE_SIZE = 10;

const notificationIdSchema = z.string().cuid();

export type NotificationsPageResult =
  | {
      ok: true;
      items: Notification[];
      total: number;
      unreadCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }
  | { ok: false; error: string };

export async function getNotificationsPage(
  page = 1,
  filter: "all" | "unread" | "read" = "all"
): Promise<NotificationsPageResult> {
  const session = await requireSession();
  const rl = await limitDashboardRead(session.userId);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Muitas consultas. Aguarde ${rl.retryAfterSec}s.`,
    };
  }

  const parsed = notificationsPageParamsSchema.safeParse({ page, filter });
  if (!parsed.success) {
    return { ok: false, error: "Parâmetros inválidos." };
  }

  const { page: p, filter: f } = parsed.data;

  const where = {
    userId: session.userId,
    ...(f === "unread" ? { read: false } : f === "read" ? { read: true } : {}),
  };

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (p - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId: session.userId, read: false },
    }),
  ]);

  return {
    ok: true,
    items,
    total,
    unreadCount,
    page: p,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getUnreadCount(): Promise<number> {
  try {
    const session = await requireSession();
    const rl = await limitDashboardRead(session.userId);
    if (!rl.ok) return 0;
    return prisma.notification.count({
      where: { userId: session.userId, read: false },
    });
  } catch {
    return 0;
  }
}

async function mutationGate(session: { userId: string }) {
  const rl = await limitDashboardMutation(session.userId);
  if (!rl.ok) {
    return { ok: false as const, error: `Aguarde ${rl.retryAfterSec}s.` };
  }
  return { ok: true as const };
}

export async function markNotificationRead(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const gate = await mutationGate(session);
  if (!gate.ok) return gate;

  const parsed = notificationIdSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Notificação inválida." };

  await prisma.notification.updateMany({
    where: { id: parsed.data, userId: session.userId },
    data: { read: true, readAt: new Date() },
  });
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const gate = await mutationGate(session);
  if (!gate.ok) return gate;

  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true, readAt: new Date() },
  });
  log.info("Todas notificações marcadas como lidas", { userId: session.userId });
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}

export async function deleteNotification(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const gate = await mutationGate(session);
  if (!gate.ok) return gate;

  const parsed = notificationIdSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Notificação inválida." };

  await prisma.notification.deleteMany({
    where: { id: parsed.data, userId: session.userId },
  });
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}

export async function deleteSelectedNotifications(
  ids: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ids.length) return { ok: false, error: "Nada selecionado." };
  const session = await requireSession();
  const gate = await mutationGate(session);
  if (!gate.ok) return gate;

  const parsed = notificationIdsDeleteSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, error: "Seleção inválida." };

  await prisma.notification.deleteMany({
    where: { id: { in: parsed.data }, userId: session.userId },
  });
  log.info("Notificações excluídas", { count: parsed.data.length });
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}
