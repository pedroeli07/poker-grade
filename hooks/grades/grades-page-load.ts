import type { AppSession } from "@/lib/auth/session";
import { getGradesListRowsForSession } from "@/lib/data/grades-list";
import { canManageGrades } from "@/lib/utils";
import type { GradesListPageProps } from "@/lib/types";

export async function loadGradesListPageProps(
  session: AppSession
): Promise<GradesListPageProps> {
  const manage = canManageGrades(session);
  const rows = await getGradesListRowsForSession(session);
  return { rows, manage };
}
