"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";

const log = createLogger("notifications.actions");

const PAGE_SIZE = 10;

export async function getNotificationsPage(page = 1, filter: "all" | "unread" | "read" = "all") {
  const session = await requireSession();

  const where = {
    userId: session.userId,
    ...(filter === "unread" ? { read: false } : filter === "read" ? { read: true } : {}),
  };

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: session.userId, read: false } }),
  ]);

  return {
    items,
    total,
    unreadCount,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getUnreadCount(): Promise<number> {
  try {
    const session = await requireSession();
    return prisma.notification.count({
      where: { userId: session.userId, read: false },
    });
  } catch {
    return 0;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  const session = await requireSession();
  await prisma.notification.updateMany({
    where: { id, userId: session.userId },
    data: { read: true, readAt: new Date() },
  });
  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsRead(): Promise<void> {
  const session = await requireSession();
  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true, readAt: new Date() },
  });
  log.info("Todas notificações marcadas como lidas", { userId: session.userId });
  revalidatePath("/dashboard/notifications");
}

export async function deleteNotification(id: string): Promise<void> {
  const session = await requireSession();
  await prisma.notification.deleteMany({
    where: { id, userId: session.userId },
  });
  revalidatePath("/dashboard/notifications");
}

export async function deleteSelectedNotifications(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const session = await requireSession();
  await prisma.notification.deleteMany({
    where: { id: { in: ids }, userId: session.userId },
  });
  log.info("Notificações excluídas", { count: ids.length });
  revalidatePath("/dashboard/notifications");
}
