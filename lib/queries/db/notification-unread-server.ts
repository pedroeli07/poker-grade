/**
 * Contagem de notificações não lidas (apenas servidor).
 * Não usar `"use server"` aqui — não expor como Server Action (evita chamadas com userId arbitrário).
 */
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { limitDashboardRead } from "@/lib/rate-limit";

/**
 * Query Prisma deduplicada por `userId` no mesmo request (ex.: layout + página de notificações).
 * Só usar após `limitDashboardRead` ou dentro de `countUnreadNotificationsForUser`.
 */
export const getCachedUnreadNotificationCountDb = cache(async (userId: string) => {
  return prisma.notification.count({
    where: { userId, read: false },
  });
});

export async function countUnreadNotificationsForUser(userId: string): Promise<number> {
  return getCachedUnreadNotificationCountDb(userId);
}
