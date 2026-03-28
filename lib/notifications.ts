/**
 * Notification utilities — create notifications for CRUD operations.
 *
 * Use the `notify*` helpers from server actions.
 * All functions are fire-and-forget: they log errors but never throw.
 */

import { prisma } from "./prisma";
import { createLogger } from "./logger";
import type { NotificationType } from "@prisma/client";

const log = createLogger("notifications");

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

async function create(data: CreateNotificationInput): Promise<void> {
  try {
    await prisma.notification.create({ data });
  } catch (err) {
    log.error("Falha ao criar notificação", err instanceof Error ? err : undefined, {
      type: data.type,
      userId: data.userId,
    });
  }
}

async function createMany(data: CreateNotificationInput[]): Promise<void> {
  if (!data.length) return;
  try {
    await prisma.notification.createMany({ data });
  } catch (err) {
    log.error("Falha ao criar notificações em lote", err instanceof Error ? err : undefined, {
      count: data.length,
    });
  }
}

/** Returns ids of all ADMIN and MANAGER auth accounts */
async function getAdminUserIds(): Promise<string[]> {
  const users = await prisma.authUser.findMany({
    where: { role: { in: ["ADMIN", "MANAGER"] } },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

/** Returns ids of all ADMIN, MANAGER and COACH auth accounts */
async function getStaffUserIds(): Promise<string[]> {
  const users = await prisma.authUser.findMany({
    where: { role: { in: ["ADMIN", "MANAGER", "COACH"] } },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

// ──────────────────────────────────────────────
// Domain-specific helpers
// ──────────────────────────────────────────────

/** Notify all admins/managers when a player is created */
export async function notifyPlayerCreated(
  playerName: string,
  playerId: string
): Promise<void> {
  const userIds = await getAdminUserIds();
  await createMany(
    userIds.map((userId) => ({
      userId,
      type: "PLAYER_CREATED" as NotificationType,
      title: "Novo jogador adicionado",
      message: `${playerName} foi cadastrado no sistema.`,
      link: `/dashboard/players/${playerId}`,
    }))
  );
}

/** Notify all staff when a grade is created or imported */
export async function notifyGradeCreated(
  gradeName: string,
  gradeId: string
): Promise<void> {
  const userIds = await getStaffUserIds();
  await createMany(
    userIds.map((userId) => ({
      userId,
      type: "GRADE_CREATED" as NotificationType,
      title: "Nova grade criada",
      message: `Grade "${gradeName}" foi adicionada ao sistema.`,
      link: `/dashboard/grades/${gradeId}`,
    }))
  );
}

/** Notify a player when a grade is assigned to them */
export async function notifyGradeAssigned(
  playerId: string,
  gradeName: string,
  gradeId: string
): Promise<void> {
  const authAccount = await prisma.authUser.findFirst({
    where: { playerId },
    select: { id: true },
  });
  if (!authAccount) return;

  await create({
    userId: authAccount.id,
    type: "GRADE_ASSIGNED",
    title: "Grade atualizada",
    message: `Sua grade "${gradeName}" foi atribuída. Acesse para ver os filtros e explicações do seu coach.`,
    link: `/dashboard/minha-grade`,
  });
}

/** Notify coaches/admins when import finishes — and player if they have an account */
export async function notifyImportDone(
  playerName: string,
  playerId: string,
  importId: string,
  extraPlayCount: number
): Promise<void> {
  const staffIds = await getStaffUserIds();
  const reviewLink =
    extraPlayCount > 0 ? "/dashboard/review" : `/dashboard/imports/${importId}`;
  const staffMessage =
    extraPlayCount > 0
      ? `${extraPlayCount} extra play${extraPlayCount > 1 ? "s" : ""} — abra Conferência de Torneios para revisar. (Importação: ${playerName})`
      : `Importação de ${playerName} sem extra plays. Detalhes em Importações.`;

  await createMany(
    staffIds.map((userId) => ({
      userId,
      type: "IMPORT_DONE" as NotificationType,
      title:
        extraPlayCount > 0
          ? `Conferência: ${playerName}`
          : `Importação: ${playerName}`,
      message: staffMessage,
      link: reviewLink,
    }))
  );

  // If player has extra plays, notify them too (if they have auth)
  if (extraPlayCount > 0) {
    const playerAuth = await prisma.authUser.findFirst({
      where: { playerId },
      select: { id: true },
    });
    if (playerAuth) {
      await create({
        userId: playerAuth.id,
        type: "EXTRA_PLAY",
        title: "Extra plays detectados",
        message: `${extraPlayCount} torneio${extraPlayCount > 1 ? "s" : ""} fora da sua grade foi${extraPlayCount > 1 ? "ram" : ""} detectado${extraPlayCount > 1 ? "s" : ""} na última importação.`,
        link: `/dashboard/imports/${importId}`,
      });
    }
  }
}

/** Notify player when a review decision is made on their tournament */
export async function notifyReviewDecision(
  playerId: string,
  tournamentName: string,
  decision: "APPROVED" | "EXCEPTION" | "REJECTED"
): Promise<void> {
  const playerAuth = await prisma.authUser.findFirst({
    where: { playerId },
    select: { id: true },
  });
  if (!playerAuth) return;

  const messages: Record<typeof decision, string> = {
    APPROVED: `Seu torneio "${tournamentName}" foi aprovado como exceção.`,
    EXCEPTION: `Seu torneio "${tournamentName}" foi marcado como exceção.`,
    REJECTED: `Seu torneio "${tournamentName}" foi marcado como infração.`,
  };

  await create({
    userId: playerAuth.id,
    type: "REVIEW_DECISION",
    title: "Revisão concluída",
    message: messages[decision],
    link: `/dashboard/players/${playerId}`,
  });
}

/** Notify player about a limit change */
export async function notifyLimitChanged(
  playerId: string,
  action: "UPGRADE" | "DOWNGRADE" | "MAINTAIN",
  fromGrade: string,
  toGrade: string
): Promise<void> {
  const playerAuth = await prisma.authUser.findFirst({
    where: { playerId },
    select: { id: true },
  });
  if (!playerAuth) return;

  const titles = {
    UPGRADE: "🎉 Promoção de limite!",
    DOWNGRADE: "Ajuste de limite",
    MAINTAIN: "Limite mantido",
  };

  const messages = {
    UPGRADE: `Parabéns! Você subiu de "${fromGrade}" para "${toGrade}". Continue assim!`,
    DOWNGRADE: `Sua grade foi ajustada de "${fromGrade}" para "${toGrade}".`,
    MAINTAIN: `Seu limite foi avaliado e mantido em "${toGrade}".`,
  };

  await create({
    userId: playerAuth.id,
    type: "LIMIT_CHANGED",
    title: titles[action],
    message: messages[action],
    link: `/dashboard/minha-grade`,
  });
}

export { create as createNotification, createMany as createNotifications };
