"use server";

import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStaffUserIds, getPlayerAuthUserId } from "./recipients";
import { insertNotification, insertNotificationsMany } from "./insert";
import { CreateNotificationInput } from "@/lib/types/notification/index";
import { sendTargetCreatedEmails, type TargetCreatedEmailPayload } from "@/lib/email/app-events";

export async function notifyTargetCreated(
  playerId: string,
  targetName: string,
  detail: TargetCreatedEmailPayload
): Promise<void> {
  const [player, playerAuth, staffIds] = await Promise.all([
    prisma.player.findUnique({ where: { id: playerId }, select: { name: true } }),
    prisma.authUser.findFirst({ where: { playerId }, select: { id: true } }),
    getStaffUserIds(),
  ]);

  const playerName = player?.name ?? "Jogador";
  const staffLink = `/admin/grades/metas`;

  const notifications: CreateNotificationInput[] = staffIds.map((userId) => ({
    userId,
    type: "TARGET_CREATED" as NotificationType,
    title: "Nova meta criada",
    message: `Meta "${targetName}" adicionada para ${playerName}.`,
    link: staffLink,
  }));

  if (playerAuth) {
    notifications.push({
      userId: playerAuth.id,
      type: "TARGET_CREATED",
      title: "Nova meta para você",
      message: `Seu coach definiu a meta "${targetName}". Acesse para conferir.`,
      link: `/jogador/metas`,
    });
  }

  await insertNotificationsMany(notifications);

  void sendTargetCreatedEmails(playerId, playerName, detail);
}

export async function notifyTargetUpdated(
  playerId: string,
  targetName: string
): Promise<void> {
  const [player, playerAuthId, staffIds] = await Promise.all([
    prisma.player.findUnique({ where: { id: playerId }, select: { name: true } }),
    getPlayerAuthUserId(playerId),
    getStaffUserIds(),
  ]);
  const playerName = player?.name ?? "Jogador";
  const notifications: CreateNotificationInput[] = staffIds.map((userId) => ({
    userId,
    type: "TARGET_UPDATED" as NotificationType,
    title: "Meta atualizada",
    message: `Meta "${targetName}" de ${playerName} foi editada.`,
    link: `/admin/grades/metas`,
  }));
  if (playerAuthId) {
    notifications.push({
      userId: playerAuthId,
      type: "TARGET_UPDATED",
      title: "Sua meta foi atualizada",
      message: `A meta "${targetName}" foi editada pelo seu coach.`,
      link: `/jogador/metas`,
    });
  }
  await insertNotificationsMany(notifications);
}

export async function notifyTargetDeleted(
  playerId: string,
  targetName: string
): Promise<void> {
  const [player, playerAuthId, staffIds] = await Promise.all([
    prisma.player.findUnique({ where: { id: playerId }, select: { name: true } }),
    getPlayerAuthUserId(playerId),
    getStaffUserIds(),
  ]);
  const playerName = player?.name ?? "Jogador";
  const notifications: CreateNotificationInput[] = staffIds.map((userId) => ({
    userId,
    type: "TARGET_DELETED" as NotificationType,
    title: "Meta excluída",
    message: `Meta "${targetName}" de ${playerName} foi removida.`,
    link: `/admin/grades/metas`,
  }));
  if (playerAuthId) {
    notifications.push({
      userId: playerAuthId,
      type: "TARGET_DELETED",
      title: "Meta removida",
      message: `A meta "${targetName}" foi removida pelo seu coach.`,
      link: `/jogador/metas`,
    });
  }
  await insertNotificationsMany(notifications);
}

export async function notifyTargetsDeletedBatch(
  items: { playerId: string; targetName: string }[]
): Promise<void> {
  if (!items.length) return;
  if (items.length === 1) {
    await notifyTargetDeleted(items[0]!.playerId, items[0]!.targetName);
    return;
  }
  const staffIds = await getStaffUserIds();
  const count = items.length;
  const notifications: CreateNotificationInput[] = staffIds.map((userId) => ({
    userId,
    type: "TARGET_DELETED" as NotificationType,
    title: "Metas excluídas",
    message: `${count} metas foram removidas.`,
    link: `/admin/grades/metas`,
  }));
  const byPlayer = new Map<string, string[]>();
  for (const it of items) {
    const arr = byPlayer.get(it.playerId) ?? [];
    arr.push(it.targetName);
    byPlayer.set(it.playerId, arr);
  }
  const playerAuthIds = await prisma.authUser.findMany({
    where: { playerId: { in: Array.from(byPlayer.keys()) } },
    select: { id: true, playerId: true },
  });
  for (const au of playerAuthIds) {
    const names = byPlayer.get(au.playerId!) ?? [];
    notifications.push({
      userId: au.id,
      type: "TARGET_DELETED",
      title: names.length > 1 ? "Metas removidas" : "Meta removida",
      message:
        names.length > 1
          ? `${names.length} metas suas foram removidas.`
          : `A meta "${names[0]}" foi removida pelo seu coach.`,
      link: `/jogador/metas`,
    });
  }
  await insertNotificationsMany(notifications);
}
