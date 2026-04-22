"use server";

import { prisma } from "@/lib/prisma";
import { insertLog } from "@/lib/constants/queries-mutations";
import { CreateNotificationInput } from "@/lib/types/notification/index";

export async function insertNotification(data: CreateNotificationInput): Promise<void> {
  try {
    await prisma.notification.create({ data });
  } catch (err) {
    insertLog.error("Falha ao criar notificação", err instanceof Error ? err : undefined, {
      type: data.type,
      userId: data.userId,
    });
  }
}

export async function insertNotificationsMany(data: CreateNotificationInput[]): Promise<void> {
  if (!data.length) return;
  try {
    await prisma.notification.createMany({ data });
  } catch (err) {
    insertLog.error("Falha ao criar notificações em lote", err instanceof Error ? err : undefined, {
      count: data.length,
    });
  }
}
