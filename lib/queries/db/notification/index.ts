"use server";

import type { Notification as DbNotification, LimitAction, NotificationType, Prisma, ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { limitDashboardMutation, limitDashboardRead } from "@/lib/rate-limit";
import { notificationIdsDeleteSchema, notificationsPageParamsSchema } from "@/lib/schemas";
import { NOTIFICATION_PAGE_SIZE, notificationIdSchema } from "@/lib/constants";
import { insertLog, notificationsQueriesLog } from "@/lib/constants/queries-mutations";
import {
  countUnreadNotificationsForUser,
  getCachedUnreadNotificationCountDb,
} from "@/lib/queries/db/notification-unread-server";
import { logPerf } from "@/lib/utils/perf";
import { CreateNotificationInput, ErrorTypes, NotificationFilterType, NotificationItem, NotificationsPageResult } from "@/lib/types";
import { UserRole } from "@prisma/client";


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

async function mutationGate(session: { userId: string }) {
  const rl = await limitDashboardMutation(session.userId);
  if (!rl.ok) return { ok: false as const, error: `Aguarde ${rl.retryAfterSec}s.` };
  return { ok: true as const };
}

export async function markNotificationRead(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const gate = await mutationGate(session);
  if (!gate.ok) return gate;

  const parsed = notificationIdSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: ErrorTypes.INVALID_DATA };

  await prisma.notification.updateMany({
    where: { id: parsed.data, userId: session.userId },
    data: { read: true, readAt: new Date() },
  });
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const gate = await mutationGate(session);
  if (!gate.ok) return gate;

  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true, readAt: new Date() },
  });
  notificationsQueriesLog.info("Todas marcadas como lidas", { userId: session.userId });
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}

export async function deleteNotification(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const gate = await mutationGate(session);
  if (!gate.ok) return gate;

  const parsed = notificationIdSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: ErrorTypes.INVALID_DATA };

  await prisma.notification.deleteMany({
    where: { id: parsed.data, userId: session.userId },
  });
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}

export async function deleteSelectedNotifications(
  ids: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ids.length) return { ok: false, error: "Nada selecionado." };
  const session = await requireSession();
  const gate = await mutationGate(session);
  if (!gate.ok) return gate;

  const parsed = notificationIdsDeleteSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, error: ErrorTypes.INVALID_DATA };

  await prisma.notification.deleteMany({
    where: { id: { in: parsed.data }, userId: session.userId },
  });
  notificationsQueriesLog.info("Excluídas", { count: parsed.data.length });
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}

// ── Inserção (server-only, chamado por outras queries/actions) ───────────────

async function insertNotification(data: CreateNotificationInput): Promise<void> {
  try {
    await prisma.notification.create({ data });
  } catch (err) {
    insertLog.error("Falha ao criar notificação", err instanceof Error ? err : undefined, {
      type: data.type,
      userId: data.userId,
    });
  }
}

async function insertNotificationsMany(data: CreateNotificationInput[]): Promise<void> {
  if (!data.length) return;
  try {
    await prisma.notification.createMany({ data });
  } catch (err) {
    insertLog.error("Falha ao criar notificações em lote", err instanceof Error ? err : undefined, {
      count: data.length,
    });
  }
}

async function getAdminUserIds(): Promise<string[]> {
  const users = await prisma.authUser.findMany({
    where: { role: { in: [UserRole.ADMIN, UserRole.MANAGER] } },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

async function getStaffUserIds(): Promise<string[]> {
  const users = await prisma.authUser.findMany({
    where: { role: { in: [UserRole.ADMIN, UserRole.MANAGER, UserRole.COACH] } },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function notifyPlayerCreated(
  playerName: string,
  playerId: string
): Promise<void> {
  const userIds = await getAdminUserIds();
  await insertNotificationsMany(
    userIds.map((userId) => ({
      userId,
      type: "PLAYER_CREATED" as NotificationType,
      title: "Novo jogador adicionado",
      message: `${playerName} foi cadastrado no sistema.`,
      link: `/dashboard/players/${playerId}`,
    }))
  );
}

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
      link: `/dashboard/grades/${gradeId}`,
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
    link: `/dashboard/minha-grade`,
  });
}

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

  await insertNotificationsMany(
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
        link: `/dashboard/imports/${importId}`,
      });
    }
  }
}

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
    link: `/dashboard/players/${playerId}`,
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
  const staffLink = `/dashboard/players/${playerId}`;

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
      link: `/dashboard/minha-grade`,
    });
  }

  await insertNotificationsMany(notifications);
}

export { insertNotification as createNotification, insertNotificationsMany as createNotifications };
