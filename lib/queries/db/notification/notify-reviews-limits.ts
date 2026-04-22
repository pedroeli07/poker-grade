"use server";

import { ReviewStatus, type LimitAction, type NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStaffUserIds } from "./recipients";
import { insertNotification, insertNotificationsMany } from "./insert";
import { CreateNotificationInput } from "@/lib/types/notification/index";
import { sendLimitChangeEmails } from "@/lib/email/app-events";

export async function notifyReviewDecision(
  playerId: string,
  tournamentName: string,
  decision: ReviewStatus
): Promise<void> {
  const playerAuth = await prisma.authUser.findFirst({
    where: { playerId },
    select: { id: true },
  });
  if (!playerAuth) return;

  const messages: Record<ReviewStatus, string> = {
    PENDING: `Seu torneio "${tournamentName}" está em análise.`,
    APPROVED: `Seu torneio "${tournamentName}" foi aprovado como exceção.`,
    EXCEPTION: `Seu torneio "${tournamentName}" foi marcado como exceção.`,
    REJECTED: `Seu torneio "${tournamentName}" foi marcado como infração.`,
  };

  await insertNotification({
    userId: playerAuth.id,
    type: "REVIEW_DECISION",
    title: "Revisão concluída",
    message: messages[decision],
    link: `/admin/jogadores/${playerId}`,
  });
}

export async function notifyLimitChanged(
  playerId: string,
  action: LimitAction,
  fromGrade: string,
  toGrade: string
): Promise<void> {
  const [player, playerAuth, staffIds] = await Promise.all([
    prisma.player.findUnique({ where: { id: playerId }, select: { name: true } }),
    prisma.authUser.findFirst({ where: { playerId }, select: { id: true } }),
    getStaffUserIds(),
  ]);

  const titles = {
    UPGRADE: "🎉 Promoção de limite!",
    DOWNGRADE: "Ajuste de limite",
    MAINTAIN: "Limite mantido",
  } as const;

  const playerMessages = {
    UPGRADE: `Parabéns! Você subiu de "${fromGrade}" para "${toGrade}". Continue assim!`,
    DOWNGRADE: `Sua grade foi ajustada de "${fromGrade}" para "${toGrade}".`,
    MAINTAIN: `Seu limite foi avaliado e mantido em "${toGrade}".`,
  } as const;

  const staffTitles = {
    UPGRADE: "Subida de grade",
    DOWNGRADE: "Descida de grade",
    MAINTAIN: "Manutenção de grade",
  } as const;

  const playerName = player?.name ?? "Jogador";
  const staffMessage = `${playerName}: "${fromGrade}" → "${toGrade}".`;
  const staffLink = `/admin/jogadores/${playerId}`;

  const notifications: CreateNotificationInput[] = staffIds.map((userId) => ({
    userId,
    type: "LIMIT_CHANGED" as NotificationType,
    title: staffTitles[action],
    message: staffMessage,
    link: staffLink,
  }));

  if (playerAuth) {
    notifications.push({
      userId: playerAuth.id,
      type: "LIMIT_CHANGED",
      title: titles[action],
      message: playerMessages[action],
      link: `/jogador/minha-grade`,
    });
  }

  await insertNotificationsMany(notifications);

  void sendLimitChangeEmails({
    playerId,
    playerName,
    action,
    fromGrade,
    toGrade,
  });
}
