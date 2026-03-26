"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/auth/session";
import {
  allowedInviteFormSchema,
  idParamSchema,
  updateAuthAccountFormSchema,
  updatePendingInviteFormSchema,
} from "@/lib/validation/schemas";
import { isSuperAdminEmail } from "@/lib/auth/bootstrap";
import { createLogger } from "@/lib/logger";

const log = createLogger("usuarios.actions");

const ADMIN_ONLY = [UserRole.ADMIN] as const;

async function assertLastAdminGuard(
  userId: string,
  nextRole: UserRole
): Promise<string | null> {
  if (nextRole === UserRole.ADMIN) return null;
  const row = await prisma.authUser.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (row?.role !== UserRole.ADMIN) return null;
  const n = await prisma.authUser.count({ where: { role: UserRole.ADMIN } });
  if (n <= 1) {
    return "Deve existir pelo menos um administrador.";
  }
  return null;
}

export async function addAllowedInvite(formData: FormData) {
  const session = await requireRoles(ADMIN_ONLY);

  const parsed = allowedInviteFormSchema.safeParse({
    email: formData.get("email")?.toString(),
    role: formData.get("role")?.toString(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { email, role } = parsed.data;

  if (isSuperAdminEmail(email)) {
    return {
      error: "Este e-mail é reservado ao administrador principal e não precisa de convite.",
    };
  }

  const [authDup, inviteDup] = await Promise.all([
    prisma.authUser.findUnique({ where: { email }, select: { id: true } }),
    prisma.allowedEmail.findUnique({ where: { email }, select: { id: true } }),
  ]);
  if (authDup) return { error: "Este e-mail já possui conta." };
  if (inviteDup) return { error: "Este e-mail já está na lista de convites." };

  try {
    await prisma.allowedEmail.create({
      data: { email, role, addedById: session.userId },
    });
    log.info("Convite adicionado", { email, role, by: session.userId });
    revalidatePath("/dashboard/usuarios");
    return { success: true as const };
  } catch (e) {
    log.error("addAllowedInvite", e instanceof Error ? e : undefined);
    return { error: "Erro ao salvar o convite." };
  }
}

export async function updatePendingInvite(formData: FormData) {
  await requireRoles(ADMIN_ONLY);

  const parsed = updatePendingInviteFormSchema.safeParse({
    id: formData.get("id")?.toString(),
    email: formData.get("email")?.toString(),
    role: formData.get("role")?.toString(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { id, email, role } = parsed.data;

  if (isSuperAdminEmail(email)) {
    return { error: "Não é possível usar o e-mail do administrador principal em convites." };
  }

  const row = await prisma.allowedEmail.findUnique({
    where: { id },
    select: { email: true },
  });
  if (!row) return { error: "Convite não encontrado." };

  const [authDup, inviteDup] = await Promise.all([
    prisma.authUser.findUnique({ where: { email }, select: { id: true } }),
    prisma.allowedEmail.findFirst({
      where: { email, NOT: { id } },
      select: { id: true },
    }),
  ]);
  if (authDup) return { error: "Este e-mail já possui conta." };
  if (inviteDup) return { error: "Este e-mail já está em outro convite." };

  try {
    await prisma.allowedEmail.update({
      where: { id },
      data: { email, role },
    });
    revalidatePath("/dashboard/usuarios");
    return { success: true as const };
  } catch (e) {
    log.error("updatePendingInvite", e instanceof Error ? e : undefined);
    return { error: "Erro ao atualizar o convite." };
  }
}

export async function updateAuthAccount(formData: FormData) {
  await requireRoles(ADMIN_ONLY);

  const parsed = updateAuthAccountFormSchema.safeParse({
    id: formData.get("id")?.toString(),
    email: formData.get("email")?.toString(),
    role: formData.get("role")?.toString(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { id, email, role } = parsed.data;

  const current = await prisma.authUser.findUnique({
    where: { id },
    select: { email: true, role: true },
  });
  if (!current) return { error: "Usuário não encontrado." };

  if (isSuperAdminEmail(current.email)) {
    if (!isSuperAdminEmail(email)) {
      return { error: "O e-mail do administrador principal não pode ser alterado." };
    }
    if (role !== UserRole.ADMIN) {
      return { error: "O administrador principal deve permanecer como Admin." };
    }
  } else {
    const lastAdmin = await assertLastAdminGuard(id, role);
    if (lastAdmin) return { error: lastAdmin };
  }

  const emailTaken = await prisma.authUser.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });
  if (emailTaken) return { error: "Este e-mail já está em uso." };

  try {
    await prisma.authUser.update({
      where: { id },
      data: { email, role },
    });
    log.info("Conta atualizada", { id, email, role });
    revalidatePath("/dashboard/usuarios");
    return { success: true as const };
  } catch (e) {
    log.error("updateAuthAccount", e instanceof Error ? e : undefined);
    return { error: "Erro ao atualizar a conta." };
  }
}

export async function deletePendingInvite(formData: FormData) {
  await requireRoles(ADMIN_ONLY);

  const parsed = idParamSchema.safeParse({
    id: formData.get("id")?.toString(),
  });
  if (!parsed.success) return { error: "ID inválido." };

  try {
    await prisma.allowedEmail.deleteMany({ where: { id: parsed.data.id } });
    revalidatePath("/dashboard/usuarios");
    return { success: true as const };
  } catch (e) {
    log.error("deletePendingInvite", e instanceof Error ? e : undefined);
    return { error: "Erro ao remover o convite." };
  }
}

export async function deleteAuthAccount(formData: FormData) {
  const session = await requireRoles(ADMIN_ONLY);

  const parsed = idParamSchema.safeParse({
    id: formData.get("id")?.toString(),
  });
  if (!parsed.success) return { error: "ID inválido." };

  const target = await prisma.authUser.findUnique({
    where: { id: parsed.data.id },
    select: { email: true, role: true },
  });
  if (!target) return { error: "Usuário não encontrado." };

  if (parsed.data.id === session.userId) {
    return { error: "Você não pode excluir a própria conta." };
  }

  if (isSuperAdminEmail(target.email)) {
    return { error: "A conta do administrador principal não pode ser excluída." };
  }

  if (target.role === UserRole.ADMIN) {
    const n = await prisma.authUser.count({ where: { role: UserRole.ADMIN } });
    if (n <= 1) return { error: "Não é possível remover o único administrador." };
  }

  try {
    await prisma.authUser.delete({ where: { id: parsed.data.id } });
    log.info("Conta removida", { id: parsed.data.id });
    revalidatePath("/dashboard/usuarios");
    return { success: true as const };
  } catch (e) {
    log.error("deleteAuthAccount", e instanceof Error ? e : undefined);
    return { error: "Erro ao excluir a conta." };
  }
}
