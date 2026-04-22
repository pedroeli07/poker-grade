"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/auth/session";
import {
  allowedInviteFormSchema,
  idParamSchema,
  updatePendingInviteFormSchema,
} from "@/lib/schemas/auth";
import { isSuperAdminEmail } from "@/lib/utils/auth-session";
import { getRegisterAbsoluteUrl } from "@/lib/utils/app-routing";
import { isMailerConfigured, sendInviteEmail } from "@/lib/mailer";
import { ROLE_OPTIONS } from "@/lib/constants/session-rbac";
import { USERS_MANAGE_ROLES, userQueriesLog } from "@/lib/constants/queries-mutations";
import { ErrorTypes } from "@/lib/types/primitives";

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
