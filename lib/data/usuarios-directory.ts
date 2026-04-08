import { prisma } from "@/lib/prisma";
import type { UsuarioDirectoryRow } from "@/lib/types";

/** Lista convites pendentes + contas (uma query paralela por tipo). */
export async function getUsuarioDirectoryRows(): Promise<UsuarioDirectoryRow[]> {
  const [invites, accounts] = await Promise.all([
    prisma.allowedEmail.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, createdAt: true },
    }),
    prisma.authUser.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, createdAt: true },
    }),
  ]);

  const pending: UsuarioDirectoryRow[] = invites.map((r) => ({
    kind: "pending",
    id: r.id,
    email: r.email,
    role: r.role,
    createdAt: r.createdAt.toISOString(),
    isRegistered: false,
  }));

  const registered: UsuarioDirectoryRow[] = accounts.map((r) => ({
    kind: "account",
    id: r.id,
    email: r.email,
    role: r.role,
    createdAt: r.createdAt.toISOString(),
    isRegistered: true,
  }));

  return [...pending, ...registered].sort((a, b) =>
    a.email.localeCompare(b.email, "pt")
  );
}
