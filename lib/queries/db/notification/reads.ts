"use server";

import type { Notification as DbNotification, NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { limitDashboardRead } from "@/lib/rate-limit";
import { notificationsPageParamsSchema } from "@/lib/schemas/review-import";
import { NOTIFICATION_PAGE_SIZE } from "@/lib/constants/notification";
import {
  countUnreadNotificationsForUser,
  getCachedUnreadNotificationCountDb,
} from "@/lib/queries/db/notification-unread-server";
import { logPerf } from "@/lib/utils/perf";
import { NotificationItem, NotificationsPageResult } from "@/lib/types/notification/index";
import { NotificationFilterType } from "@/lib/types/primitives";

function toNotificationItem(row: DbNotification): NotificationItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link,
    read: row.read,
    createdAt: row.createdAt,
  };
}

function utcDayStart(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

function utcDayEnd(iso: string): Date {
  return new Date(`${iso}T23:59:59.999Z`);
}

export async function getNotificationsPage(
  page = 1,
  filter: NotificationFilterType = NotificationFilterType.ALL as NotificationFilterType,
  pageSize = NOTIFICATION_PAGE_SIZE,
  types: NotificationType[] = [],
  search?: string | null,
  dateFrom?: string | null,
  dateTo?: string | null
): Promise<NotificationsPageResult> {
  const session = await requireSession();
  const rl = await limitDashboardRead(session.userId);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Muitas consultas. Aguarde ${rl.retryAfterSec}s.`,
    };
  }

  const parsed = notificationsPageParamsSchema.safeParse({
    page,
    filter,
    pageSize,
    types,
    search: search ?? undefined,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined,
  });
  if (!parsed.success) return { ok: false, error: "Parâmetros inválidos." };

  const { page: p, filter: f, pageSize: ps, types: t, search: sq, dateFrom: df, dateTo: dt } = parsed.data;

  const where: Prisma.NotificationWhereInput = {
    userId: session.userId,
    ...(f === NotificationFilterType.UNREAD ? { read: false } : f === NotificationFilterType.READ ? { read: true } : {}),
    ...(t && t.length > 0 ? { type: { in: t } } : {}),
  };

  const andClauses: Prisma.NotificationWhereInput[] = [];
  if (sq) {
    andClauses.push({
      OR: [
        { title: { contains: sq, mode: "insensitive" } },
        { message: { contains: sq, mode: "insensitive" } },
      ],
    });
  }
  if (df || dt) {
    andClauses.push({
      createdAt: {
        ...(df ? { gte: utcDayStart(df) } : {}),
        ...(dt ? { lte: utcDayEnd(dt) } : {}),
      },
    });
  }
  if (andClauses.length) {
    where.AND = andClauses;
  }

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (p - 1) * ps,
      take: ps,
    }),
    prisma.notification.count({ where }),
    getCachedUnreadNotificationCountDb(session.userId),
  ]);

  return {
    ok: true,
    items: items.map(toNotificationItem),
    total,
    unreadCount,
    page: p,
    pageSize: ps,
    totalPages: Math.max(1, Math.ceil(total / ps)),
  };
}

export async function getUnreadCount(): Promise<number> {
  try {
    const t0 = performance.now();
    const session = await requireSession();
    logPerf("notifications.unread", "requireSession", t0);

    const tCount = performance.now();
    const n = await countUnreadNotificationsForUser(session.userId);
    logPerf("notifications.unread", "countForUser", tCount);
    return n;
  } catch {
    return 0;
  }
}
