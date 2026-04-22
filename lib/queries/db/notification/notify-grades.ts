"use server";

import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStaffUserIds } from "./recipients";
import { insertNotification, insertNotificationsMany } from "./insert";

export async function notifyGradeCreated(
  gradeName: string,
  gradeId: string
): Promise<void> {
  const userIds = await getStaffUserIds();
  await insertNotificationsMany(
    userIds.map((userId) => ({
      userId,
      type: "GRADE_CREATED" as NotificationType,
      title: "Nova grade criada",
      message: `Grade "${gradeName}" foi adicionada ao sistema.`,
      link: `/admin/grades/perfis/${gradeId}`,
    }))
  );
}

export async function notifyGradeAssigned(
  playerId: string,
  gradeName: string
): Promise<void> {
  const authAccount = await prisma.authUser.findFirst({
    where: { playerId },
    select: { id: true },
  });
  if (!authAccount) return;

  await insertNotification({
    userId: authAccount.id,
    type: "GRADE_ASSIGNED",
    title: "Grade atualizada",
    message: `Sua grade "${gradeName}" foi atribuída. Acesse para ver os filtros e explicações do seu coach.`,
    link: `/jogador/minha-grade`,
  });
}
