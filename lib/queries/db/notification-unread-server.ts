/**
 * Contagem de notificações não lidas (apenas servidor).
 * Não usar `"use server"` aqui — não expor como Server Action (evita chamadas com userId arbitrário).
 */
import { prisma } from "@/lib/prisma";
import { limitDashboardRead } from "@/lib/rate-limit";

export async function countUnreadNotificationsForUser(userId: string): Promise<number> {
  const rl = await limitDashboardRead(userId);
  if (!rl.ok) return 0;
  return prisma.notification.count({
    where: { userId, read: false },
  });
}
