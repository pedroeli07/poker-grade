"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PlayerStatus, UserRole } from "@prisma/client";
import { requireRoles } from "@/lib/auth/session";
import { idParamSchema, updateAuthAccountFormSchema } from "@/lib/schemas/auth";
import { isSuperAdminEmail } from "@/lib/utils/auth-session";
import { USERS_MANAGE_ROLES, userQueriesLog } from "@/lib/constants/queries-mutations";
import { notifyUserDeleted, notifyUserUpdated } from "@/lib/queries/db/notification/notify-accounts";
import { ErrorTypes } from "@/lib/types/primitives";

async function assertLastAdminGuard(userId: string, nextRole: UserRole): Promise<string | null> {
  if (nextRole === UserRole.ADMIN) return null;
  const row = await prisma.authUser.findUnique({ where: { id: userId }, select: { role: true } });
  if (row?.role !== UserRole.ADMIN) return null;
  const n = await prisma.authUser.count({ where: { role: UserRole.ADMIN } });
  if (n <= 1) return "Deve existir pelo menos um administrador.";
  return null;
}

export async function updateAuthAccount(formData: FormData) {
  await requireRoles(USERS_MANAGE_ROLES);

  const parsed = updateAuthAccountFormSchema.safeParse({
    id: formData.get("id")?.toString(),
    email: formData.get("email")?.toString(),
    role: formData.get("role")?.toString(),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? ErrorTypes.INVALID_DATA };

  const { id, email, role } = parsed.data;

  const current = await prisma.authUser.findUnique({ where: { id }, select: { email: true, role: true } });
  if (!current) return { error: ErrorTypes.NOT_FOUND };

  if (isSuperAdminEmail(current.email)) {
    if (!isSuperAdminEmail(email)) return { error: "O e-mail do administrador principal não pode ser alterado." };
    if (role !== UserRole.ADMIN) return { error: "O administrador principal deve permanecer como Admin." };
  } else {
    const lastAdmin = await assertLastAdminGuard(id, role);
    if (lastAdmin) return { error: lastAdmin };
  }

  const emailTaken = await prisma.authUser.findFirst({ where: { email, NOT: { id } }, select: { id: true } });
  if (emailTaken) return { error: "Este e-mail já está em uso." };

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.authUser.findUniqueOrThrow({
        where: { id },
        select: { role: true, playerId: true, coachId: true, displayName: true },
      });

      await tx.authUser.update({ where: { id }, data: { email, role } });

      if (before.role !== role) {
        if (before.role === UserRole.PLAYER && before.playerId) {
          await tx.authUser.update({ where: { id }, data: { playerId: null } });
          await tx.player.delete({ where: { id: before.playerId } });
        }
        if (before.role === UserRole.COACH && before.coachId) {
          await tx.authUser.update({ where: { id }, data: { coachId: null } });
          await tx.coach.delete({ where: { id: before.coachId } });
        }

        if (role === UserRole.PLAYER) {
          const name = before.displayName?.trim() || email.split("@")[0] || "Jogador";
          let player = await tx.player.findUnique({ where: { email } });
          if (!player) {
            player = await tx.player.create({
              data: { name, email, status: PlayerStatus.ACTIVE },
            });
          }
          await tx.authUser.update({ where: { id }, data: { playerId: player.id } });
        }
        if (role === UserRole.COACH) {
          const name = before.displayName?.trim() || email.split("@")[0] || "Coach";
          let coach = await tx.coach.findUnique({ where: { email } });
          if (!coach) {
            coach = await tx.coach.create({ data: { name, email } });
          }
          await tx.authUser.update({ where: { id }, data: { coachId: coach.id } });
        }
      }
    });

    userQueriesLog.info("Conta atualizada", { id, email, role });
    await notifyUserUpdated(email, role);
    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/jogadores");
    revalidatePath("/admin/dashboard");
    return { success: true as const };
  } catch (e) {
    userQueriesLog.error("updateAuthAccount", e instanceof Error ? e : undefined);
    return { error: ErrorTypes.OPERATION_FAILED };
  }
}

export async function deleteAuthAccount(formData: FormData) {
  const session = await requireRoles(USERS_MANAGE_ROLES);

  const parsed = idParamSchema.safeParse({ id: formData.get("id")?.toString() });
  if (!parsed.success) return { error: ErrorTypes.INVALID_DATA };

  const target = await prisma.authUser.findUnique({
    where: { id: parsed.data.id },
    select: { email: true, role: true, coachId: true, playerId: true },
  });
  if (!target) return { error: ErrorTypes.NOT_FOUND };

  if (parsed.data.id === session.userId) return { error: "Você não pode excluir a própria conta." };
  if (isSuperAdminEmail(target.email)) return { error: "A conta do administrador principal não pode ser excluída." };

  if (target.role === UserRole.ADMIN) {
    const n = await prisma.authUser.count({ where: { role: UserRole.ADMIN } });
    if (n <= 1) return { error: "Não é possível remover o único administrador." };
  }

  const coachId = target.coachId;
  const playerId = target.playerId;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.authUser.delete({ where: { id: parsed.data.id } });
      if (coachId) await tx.coach.delete({ where: { id: coachId } });
      if (playerId) await tx.player.delete({ where: { id: playerId } });
    });
    userQueriesLog.info("Conta removida", {
      id: parsed.data.id,
      coachRemoved: Boolean(coachId),
      playerRemoved: Boolean(playerId),
    });
    await notifyUserDeleted(target.email);
    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/jogadores");
    revalidatePath("/admin/dashboard");
    return { success: true as const };
  } catch (e) {
    userQueriesLog.error("deleteAuthAccount", e instanceof Error ? e : undefined);
    return { error: "Erro ao excluir a conta." };
  }
}
