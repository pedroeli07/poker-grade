import { prisma } from "@/lib/prisma";

/**
 * Coaches com conta de login ativa. Linhas em `coaches` sem `auth_users`
 * vinculado (ex.: após exclusão incompleta) não entram na lista.
 */
export async function getCoachesWithActiveLogin() {
  return prisma.coach.findMany({
    where: {
      authAccount: { isNot: null },
    },
    orderBy: { name: "asc" },
  });
}
