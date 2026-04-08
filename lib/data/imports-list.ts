import type { ImportListRow } from "@/lib/types";
import type { AppSession } from "@/lib/auth/session";
import { getImportsForSession } from "./queries";

export async function getImportsListRowsForSession(
  session: AppSession
): Promise<ImportListRow[]> {
  const rows = await getImportsForSession(session);
  return rows.map((r) => ({
    id: r.id,
    fileName: r.fileName,
    playerName: r.playerName,
    totalRows: r.totalRows,
    matchedInGrade: r.matchedInGrade,
    suspect: r.suspect,
    outOfGrade: r.outOfGrade,
    createdAt: r.createdAt,
  }));
}
