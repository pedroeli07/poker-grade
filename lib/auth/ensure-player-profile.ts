import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { PlayerStatus, UserRole } from "@prisma/client";

const log = createLogger("auth.ensure-player-profile");

/**
 * Garante que um usuário PLAYER tenha linha em `players` e `auth_users.playerId`.
 * Corrige contas PLAYER criadas sem o vínculo (ex.: falha parcial no registro).
 */
export async function ensurePlayerProfileLinked(userId: string): Promise<string | null> {
  return prisma.$transaction(async (tx) => {
    const u = await tx.authUser.findUnique({
      where: { id: userId },
      select: { id: true, role: true, playerId: true, email: true, displayName: true },
    });
    if (!u || u.role !== UserRole.PLAYER) return u?.playerId ?? null;
    if (u.playerId) return u.playerId;

    let player = await tx.player.findUnique({ where: { email: u.email } });
    if (!player) {
      const name = u.displayName?.trim() || u.email.split("@")[0] || "Jogador";
      player = await tx.player.create({
        data: { name, email: u.email, status: PlayerStatus.ACTIVE },
      });
      log.info("Player criado e vinculado ao login", { userId: u.id, playerId: player.id });
    } else {
      log.info("Player existente vinculado ao login", { userId: u.id, playerId: player.id });
    }

    await tx.authUser.update({
      where: { id: u.id },
      data: { playerId: player.id },
    });
    return player.id;
  });
}

/** Vincula contas PLAYER sem `playerId` a uma linha em `players` (self-healing). */
export async function syncOrphanPlayerProfiles(): Promise<void> {
  const orphans = await prisma.authUser.findMany({
    where: { role: UserRole.PLAYER, playerId: null },
    select: { id: true },
  });
  if (orphans.length === 0) return;
  log.info("Sincronizando players órfãos", { count: orphans.length });
  await Promise.all(orphans.map((o) => ensurePlayerProfileLinked(o.id)));
}
