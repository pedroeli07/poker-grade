"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { verifySessionJwt } from "@/lib/auth/jwt";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getUserPermissions() {
  const jar = await cookies();
  const cookie = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return { canManage: false };

  try {
    const session = await verifySessionJwt(cookie);
    if (!session) return { canManage: false };
    const role = session.role;
    return {
      canManage: role === UserRole.ADMIN || role === UserRole.MANAGER,
    };
  } catch {
    return { canManage: false };
  }
}
import { prisma } from "@/lib/prisma";
import { PlayerStatus } from "@prisma/client";
import { requireRoles } from "@/lib/auth/session";
import {
  allowedInviteFormSchema,
  idParamSchema,
  updateAuthAccountFormSchema,
  updatePendingInviteFormSchema,
} from "@/lib/schemas";
import { isSuperAdminEmail } from "@/lib/utils";
import { getRegisterAbsoluteUrl } from "@/lib/utils/app-routing";
import { isMailerConfigured, sendInviteEmail } from "@/lib/mailer";
import { ROLE_OPTIONS } from "@/lib/constants";
import { USERS_MANAGE_ROLES, userQueriesLog } from "@/lib/constants/queries-mutations";
import { notifyUserDeleted, notifyUserUpdated } from "@/lib/queries/db/notification";
import { ErrorTypes } from "@/lib/types";

async function assertLastAdminGuard(userId: string, nextRole: UserRole): Promise<string | null> {
  if (nextRole === UserRole.ADMIN) return null;
  const row = await prisma.authUser.findUnique({ where: { id: userId }, select: { role: true } });
  if (row?.role !== UserRole.ADMIN) return null;
  const n = await prisma.authUser.count({ where: { role: UserRole.ADMIN } });
  if (n <= 1) return "Deve existir pelo menos um administrador.";
  return null;
}

export async function addAllowedInvite(formData: FormData) {
  const session = await requireRoles(USERS_MANAGE_ROLES);

  const parsed = allowedInviteFormSchema.safeParse({
    email: formData.get("email")?.toString(),
    role: formData.get("role")?.toString(),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? ErrorTypes.INVALID_DATA };

  const { email, role } = parsed.data;

  if (isSuperAdminEmail(email)) {
    return { error: "Este e-mail é reservado ao administrador principal e não precisa de convite." };
  }

  const [authDup, inviteDup] = await Promise.all([
    prisma.authUser.findUnique({ where: { email }, select: { id: true } }),
    prisma.allowedEmail.findUnique({ where: { email }, select: { id: true } }),
  ]);
  if (authDup) return { error: "Este e-mail já possui conta." };
  if (inviteDup) return { error: "Este e-mail já está na lista de convites." };

  try {
    await prisma.allowedEmail.create({ data: { email, role, addedById: session.userId } });
    userQueriesLog.info("Convite adicionado", { email, role, by: session.userId });
    revalidatePath("/admin/usuarios");

    let emailDelivery: "sent" | "skipped_no_mailer" | "failed" = "skipped_no_mailer";
    if (isMailerConfigured()) {
      const roleLabel = ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
      const registerUrl = getRegisterAbsoluteUrl();
      try {
        await sendInviteEmail(email, { roleLabel, registerUrl });
        emailDelivery = "sent";
      } catch (e) {
        userQueriesLog.error(
          "sendInviteEmail",
          e instanceof Error ? e : undefined,
          { email }
        );
        emailDelivery = "failed";
      }
    }

    return { success: true as const, emailDelivery };
  } catch (e) {
    userQueriesLog.error("addAllowedInvite", e instanceof Error ? e : undefined);
    return { error: "Erro ao salvar o convite." };
  }
}

export async function updatePendingInvite(formData: FormData) {
  await requireRoles(USERS_MANAGE_ROLES);

  const parsed = updatePendingInviteFormSchema.safeParse({
    id: formData.get("id")?.toString(),
    email: formData.get("email")?.toString(),
    role: formData.get("role")?.toString(),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? ErrorTypes.INVALID_DATA };

  const { id, email, role } = parsed.data;

  if (isSuperAdminEmail(email)) {
    return { error: "Não é possível usar o e-mail do administrador principal em convites." };
  }

  const row = await prisma.allowedEmail.findUnique({ where: { id }, select: { email: true } });
  if (!row) return { error: "Convite não encontrado." };

  const [authDup, inviteDup] = await Promise.all([
    prisma.authUser.findUnique({ where: { email }, select: { id: true } }),
    prisma.allowedEmail.findFirst({ where: { email, NOT: { id } }, select: { id: true } }),
  ]);
  if (authDup) return { error: "Este e-mail já possui conta." };
  if (inviteDup) return { error: "Este e-mail já está em outro convite." };

  try {
    await prisma.allowedEmail.update({ where: { id }, data: { email, role } });
    revalidatePath("/admin/usuarios");
    return { success: true as const };
  } catch (e) {
    userQueriesLog.error("updatePendingInvite", e instanceof Error ? e : undefined);
    return { error: "Erro ao atualizar o convite." };
  }
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

export async function deletePendingInvite(formData: FormData) {
  await requireRoles(USERS_MANAGE_ROLES);

  const parsed = idParamSchema.safeParse({ id: formData.get("id")?.toString() });
  if (!parsed.success) return { error: ErrorTypes.INVALID_DATA };

  try {
    await prisma.allowedEmail.deleteMany({ where: { id: parsed.data.id } });
    revalidatePath("/admin/usuarios");
    return { success: true as const };
  } catch (e) {
    userQueriesLog.error("deletePendingInvite", e instanceof Error ? e : undefined);
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

export async function updateProfile(data: {
  displayName?: string;
  whatsapp?: string;
  discord?: string;
}) {
  const { getSession } = await import("@/lib/auth/session");
  const session = await getSession();
  if (!session) return { error: ErrorTypes.FORBIDDEN };

  try {
    await prisma.authUser.update({
      where: { id: session.userId },
      data: {
        displayName: data.displayName,
        whatsapp: data.whatsapp,
        discord: data.discord,
      },
    });
    revalidatePath("/admin/meu-perfil");
    revalidatePath("/admin/usuarios");
    return { success: true as const };
  } catch (e) {
    userQueriesLog.error("updateProfile", e instanceof Error ? e : undefined);
    return { error: "Falha ao atualizar o perfil." };
  }
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function updateAvatar(dataUrl: string | null) {
  const { getSession } = await import("@/lib/auth/session");
  const session = await getSession();
  if (!session) return { error: ErrorTypes.FORBIDDEN };

  if (dataUrl !== null) {
    const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
    if (!match) return { error: "Imagem inválida." };
    const mime = match[1].toLowerCase();
    if (!ALLOWED_AVATAR_MIME.has(mime)) return { error: "Formato não suportado (use PNG, JPEG, WebP ou GIF)." };
    const approxBytes = Math.floor((match[2].length * 3) / 4);
    if (approxBytes > MAX_AVATAR_BYTES) return { error: "Imagem muito grande (máx. 2MB)." };
  }

  try {
    await prisma.authUser.update({
      where: { id: session.userId },
      data: { avatarUrl: dataUrl },
    });
    revalidatePath("/admin/meu-perfil");
    return { success: true as const };
  } catch (e) {
    userQueriesLog.error("updateAvatar", e instanceof Error ? e : undefined);
    return { error: "Falha ao atualizar o avatar." };
  }
}
