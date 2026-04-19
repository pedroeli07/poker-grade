import type { AppSession } from "@/lib/types";
import { IMPORT_ROLES } from "@/lib/constants";
import { getImportsListRowsForSession } from "@/lib/data/imports";
import { canDeleteImports } from "@/lib/utils";
import type { ImportsListPageProps } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { syncOrphanPlayerProfiles } from "@/lib/auth/ensure-player-profile";

export async function loadImportsListPageProps(
  session: AppSession
): Promise<ImportsListPageProps> {
  await syncOrphanPlayerProfiles();
  const [imports, playerRecords] = await Promise.all([
    getImportsListRowsForSession(session),
    prisma.player.findMany({
      where: { authAccount: { isNot: null } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return {
    imports,
    canDelete: canDeleteImports(session),
    canImport: IMPORT_ROLES.includes(session.role),
    players: playerRecords,
  };
}
