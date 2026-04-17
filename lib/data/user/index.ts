import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getCachedAuthUserProfileRow } from "@/lib/auth/cached-auth-user";
import { prisma } from "@/lib/prisma";
import { ProfileData, UserDirectoryRow, AppSession } from "@/lib/types";

export async function loadProfilePageData(session: AppSession): Promise<ProfileData | null> {
  const user = await getCachedAuthUserProfileRow(session.userId);

  if (!user) return null;

  return {
    email: user.email,
    displayName: user.displayName,
    whatsapp: user.whatsapp,
    discord: user.discord,
    role: user.role,
    createdAt: format(user.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
  };
}

export async function getUserDirectoryRows(): Promise<UserDirectoryRow[]> {
  const [invites, accounts] = await Promise.all([
    prisma.allowedEmail.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, createdAt: true },
    }),
    prisma.authUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        whatsapp: true,
        discord: true,
      },
    }),
  ]);

  const pending: UserDirectoryRow[] = invites.map((r) => ({
    kind: "pending",
    id: r.id,
    email: r.email,
    role: r.role,
    whatsapp: null,
    discord: null,
    createdAt: r.createdAt.toISOString(),
    isRegistered: false,
  }));

  const registered: UserDirectoryRow[] = accounts.map((r) => ({
    kind: "account",
    id: r.id,
    email: r.email,
    role: r.role,
    whatsapp: r.whatsapp,
    discord: r.discord,
    createdAt: r.createdAt.toISOString(),
    isRegistered: true,
  }));

  return [...pending, ...registered].sort((a, b) =>
    a.email.localeCompare(b.email, "pt")
  );
}
