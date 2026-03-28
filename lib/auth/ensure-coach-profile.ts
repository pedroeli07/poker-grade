import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";

const log = createLogger("auth.ensure-coach-profile");

/**
 * Garante que usuário COACH tenha linha em `coaches` e `auth_users.coachId`.
 * Corrige contas criadas antes do vínculo automático no registro.
 */
export async function ensureCoachProfileLinked(userId: string): Promise<string | null> {
  return prisma.$transaction(async (tx) => {
    const u = await tx.authUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        coachId: true,
        email: true,
        displayName: true,
      },
    });
    if (!u || u.role !== "COACH") return u?.coachId ?? null;
    if (u.coachId) return u.coachId;

    let coach = await tx.coach.findUnique({ where: { email: u.email } });
    if (!coach) {
      const name =
        u.displayName?.trim() ||
        u.email.split("@")[0] ||
        "Coach";
      coach = await tx.coach.create({
        data: { name, email: u.email },
      });
      log.info("Coach criado e vinculado ao login", {
        userId: u.id,
        coachId: coach.id,
      });
    } else {
      log.info("Coach existente vinculado ao login", {
        userId: u.id,
        coachId: coach.id,
      });
    }

    await tx.authUser.update({
      where: { id: u.id },
      data: { coachId: coach.id },
    });
    return coach.id;
  });
}

/** Vincula contas COACH sem `coachId` a uma linha em `coaches` (ex.: cadastro antigo). */
export async function syncOrphanCoachProfiles(): Promise<void> {
  const orphans = await prisma.authUser.findMany({
    where: { role: "COACH", coachId: null },
    select: { id: true },
  });
  if (orphans.length === 0) return;
  log.info("Sincronizando coaches órfãos", { count: orphans.length });
  await Promise.all(orphans.map((o) => ensureCoachProfileLinked(o.id)));

  const pruned = await prisma.coach.deleteMany({
    where: { authAccount: null },
  });
  if (pruned.count > 0) {
    log.info("Removidos perfis coach sem login vinculado", {
      count: pruned.count,
    });
  }
}
