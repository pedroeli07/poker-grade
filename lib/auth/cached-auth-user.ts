import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Campos usados pelo perfil e por outras leituras RSC do mesmo utilizador. */
const authUserProfileSelect = {
  email: true,
  displayName: true,
  role: true,
  createdAt: true,
  whatsapp: true,
  discord: true,
} satisfies Prisma.AuthUserSelect;

export type CachedAuthUserProfileRow = Prisma.AuthUserGetPayload<{
  select: typeof authUserProfileSelect;
}>;

/**
 * Deduplica `prisma.authUser.findUnique` por `userId` num único request RSC
 * (vários componentes/server functions podem partilhar o mesmo resultado).
 * Ver também `lib/queries/db/notification-unread-server.ts` (`getCachedUnreadNotificationCountDb`).
 */
export const getCachedAuthUserProfileRow = cache(async (userId: string) => {
  return prisma.authUser.findUnique({
    where: { id: userId },
    select: authUserProfileSelect,
  });
});
