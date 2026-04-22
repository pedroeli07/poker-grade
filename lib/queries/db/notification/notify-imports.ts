"use server";

import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStaffUserIds } from "./recipients";
import { insertNotification, insertNotificationsMany } from "./insert";
import { CreateNotificationInput } from "@/lib/types/notification/index";

export async function notifyImportDone(
  playerName: string,
  playerId: string,
  importId: string,
  extraPlayCount: number
): Promise<void> {
  const staffIds = await getStaffUserIds();
  const reviewLink =
    extraPlayCount > 0 ? "/admin/grades/revisao" : `/admin/grades/importacoes/${importId}`;
  const staffMessage =
    extraPlayCount > 0
      ? `${extraPlayCount} extra play${extraPlayCount > 1 ? "s" : ""} — abra Conferência de Torneios para revisar. (Importação: ${playerName})`
      : `Importação de ${playerName} sem extra plays. Detalhes em Importações.`;

  await insertNotificationsMany(
    staffIds.map((userId) => ({
      userId,
      type: "IMPORT_DONE" as NotificationType,
      title: extraPlayCount > 0 ? `Conferência: ${playerName}` : `Importação: ${playerName}`,
      message: staffMessage,
      link: reviewLink,
    }))
  );

  if (extraPlayCount > 0) {
    const playerAuth = await prisma.authUser.findFirst({
      where: { playerId },
      select: { id: true },
    });
    if (playerAuth) {
      await insertNotification({
        userId: playerAuth.id,
        type: "EXTRA_PLAY",
        title: "Extra plays detectados",
        message: `${extraPlayCount} torneio${extraPlayCount > 1 ? "s" : ""} fora da sua grade foi${extraPlayCount > 1 ? "ram" : ""} detectado${extraPlayCount > 1 ? "s" : ""} na última importação.`,
        link: `/admin/grades/importacoes/${importId}`,
      });
    }
  }
}

export async function notifyImportDeleted(
  imports: { playerId: string | null; playerName: string | null; count: number }[]
): Promise<void> {
  if (!imports.length) return;
  const staffIds = await getStaffUserIds();
  const total = imports.reduce((a, b) => a + b.count, 0);
  const notifications: CreateNotificationInput[] = staffIds.map((userId) => ({
    userId,
    type: "IMPORT_DELETED" as NotificationType,
    title: total > 1 ? "Importações excluídas" : "Importação excluída",
    message:
      total > 1
        ? `${total} importações foram removidas.`
        : `Importação de ${imports[0]!.playerName ?? "jogador"} foi removida.`,
    link: `/admin/grades/importacoes`,
  }));
  const playerIds = imports.map((i) => i.playerId).filter((p): p is string => !!p);
  if (playerIds.length) {
    const auths = await prisma.authUser.findMany({
      where: { playerId: { in: playerIds } },
      select: { id: true, playerId: true },
    });
    for (const au of auths) {
      notifications.push({
        userId: au.id,
        type: "IMPORT_DELETED",
        title: "Importação removida",
        message: `Uma importação com seus torneios foi removida.`,
        link: `/jogador/meus-torneios`,
      });
    }
  }
  await insertNotificationsMany(notifications);
}
