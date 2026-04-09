import type { AppSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ProfileData } from "@/lib/types";

export async function loadProfilePageData(
  session: AppSession
): Promise<ProfileData | null> {
  const user = await prisma.authUser.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      displayName: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return {
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    createdAt: format(user.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
  };
}
