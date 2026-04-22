"use server";

import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStaffUserIds } from "./recipients";
import { insertNotificationsMany } from "./insert";
import { CreateNotificationInput } from "@/lib/types/notification/index";

export async function notifyHistoryDeleted(
  items: { playerId: string; playerName: string }[]
): Promise<void> {
  if (!items.length) return;
  const staffIds = await getStaffUserIds();
  const count = items.length;
  const notifications: CreateNotificationInput[] = staffIds.map((userId) => ({
    userId,
    type: "HISTORY_DELETED" as NotificationType,
    title: count > 1 ? "Registros de histórico excluídos" : "Registro de histórico excluído",
    message:
      count > 1
        ? `${count} registros de mudança de limite foram removidos.`
        : `Registro de mudança de limite de ${items[0]!.playerName} foi removido.`,
    link: `/admin/grades/historico`,
  }));
  const uniquePlayerIds = Array.from(new Set(items.map((i) => i.playerId)));
  const auths = await prisma.authUser.findMany({
    where: { playerId: { in: uniquePlayerIds } },
    select: { id: true, playerId: true },
  });
  const countByPlayer = new Map<string, number>();
  for (const it of items) countByPlayer.set(it.playerId, (countByPlayer.get(it.playerId) ?? 0) + 1);
  for (const au of auths) {
    const n = countByPlayer.get(au.playerId!) ?? 1;
    notifications.push({
      userId: au.id,
      type: "HISTORY_DELETED",
      title: n > 1 ? "Registros de histórico removidos" : "Registro de histórico removido",
      message:
        n > 1
          ? `${n} dos seus registros de mudança de limite foram removidos.`
          : `Um registro de mudança de limite seu foi removido.`,
      link: `/jogador/historico`,
    });
  }
  await insertNotificationsMany(notifications);
}
