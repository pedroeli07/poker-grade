"use server";

import { prisma } from "@/lib/prisma";
import { canDeleteImports } from "@/lib/auth/rbac";
import { notifyImportDeleted } from "@/lib/queries/db/notification/notify-imports";
import { limitImportsDelete } from "@/lib/rate-limit";
import { deleteImportIdsSchema } from "@/lib/schemas/review-import";
import { importsQueriesLog } from "@/lib/constants/queries-mutations";
import { ErrorTypes } from "@/lib/types/primitives";
import { withImportMutation } from "./imports-mutation-helpers";
import { filterImportIdsDeletableBySession } from "./reads";

export async function deleteImports(ids: string[]): Promise<{ success: boolean; error?: string }> {
  const parsed = deleteImportIdsSchema.safeParse(ids);
  if (!parsed.success) return { success: false, error: ErrorTypes.INVALID_DATA };

  const res = await withImportMutation(
    (s) => canDeleteImports(s),
    limitImportsDelete,
    async (session) => {
      const requested = [...new Set(parsed.data)];
      const allowed = await filterImportIdsDeletableBySession(session, requested);

      if (allowed.length !== requested.length) {
        throw new Error("Uma ou mais importações não existem ou você não tem permissão para removê-las.");
      }

      const importsMeta = await prisma.tournamentImport.findMany({
        where: { id: { in: allowed } },
        select: { id: true, playerName: true },
      });
      const playerNames = importsMeta.map((m) => m.playerName).filter((n): n is string => !!n);
      const players = playerNames.length
        ? await prisma.player.findMany({
            where: { name: { in: Array.from(new Set(playerNames)) } },
            select: { id: true, name: true },
          })
        : [];
      const nameToId = new Map(players.map((p) => [p.name, p.id]));
      await prisma.playedTournament.deleteMany({ where: { importId: { in: allowed } } });
      await prisma.tournamentImport.deleteMany({ where: { id: { in: allowed } } });
      await notifyImportDeleted(
        importsMeta.map((m) => ({
          playerId: m.playerName ? (nameToId.get(m.playerName) ?? null) : null,
          playerName: m.playerName,
          count: 1,
        })),
      );
      importsQueriesLog.success("Importações excluídas", { count: allowed.length });
    }
  );

  if (!res.ok) return { success: false, error: res.error };
  return { success: true };
}
