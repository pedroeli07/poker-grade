"use server";

import { NotificationType, UserRole } from "@prisma/client";
import { getAdminUserIds, getStaffUserIds } from "./recipients";
import { insertNotificationsMany } from "./insert";

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
      link: `/admin/jogadores/${playerId}`,
    }))
  );
}

export async function notifyPlayerUpdated(
  playerId: string,
  playerName: string
): Promise<void> {
  const staffIds = await getStaffUserIds();
  await insertNotificationsMany(
    staffIds.map((userId) => ({
      userId,
      type: "PLAYER_UPDATED" as NotificationType,
      title: "Jogador atualizado",
      message: `${playerName} teve seus dados atualizados.`,
      link: `/admin/jogadores/${playerId}`,
    }))
  );
}

export async function notifyPlayerDeleted(playerName: string): Promise<void> {
  const staffIds = await getStaffUserIds();
  await insertNotificationsMany(
    staffIds.map((userId) => ({
      userId,
      type: "PLAYER_DELETED" as NotificationType,
      title: "Jogador excluído",
      message: `${playerName} foi removido do sistema.`,
      link: `/admin/jogadores`,
    }))
  );
}

export async function notifyUserUpdated(
  targetEmail: string,
  role: UserRole
): Promise<void> {
  const adminIds = await getAdminUserIds();
  await insertNotificationsMany(
    adminIds.map((userId) => ({
      userId,
      type: "USER_UPDATED" as NotificationType,
      title: "Usuário atualizado",
      message: `A conta ${targetEmail} foi atualizada (${role}).`,
      link: `/admin/usuarios`,
    }))
  );
}

export async function notifyUserDeleted(targetEmail: string): Promise<void> {
  const adminIds = await getAdminUserIds();
  await insertNotificationsMany(
    adminIds.map((userId) => ({
      userId,
      type: "USER_DELETED" as NotificationType,
      title: "Usuário excluído",
      message: `A conta ${targetEmail} foi removida.`,
      link: `/admin/usuarios`,
    }))
  );
}
