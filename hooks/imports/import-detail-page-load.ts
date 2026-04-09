import type { AppSession } from "@/lib/auth/session";
import { getImportDetailForSession } from "@/lib/queries/db";
import { canDeleteImports, canReview, schedulingCategory } from "@/lib/utils";
import type { ImportDetailPageData, Tab } from "@/lib/types";

export async function loadImportDetailPageData(
  session: AppSession,
  id: string,
  tabParam?: string
): Promise<ImportDetailPageData | null> {
  const importRecord = await getImportDetailForSession(session, id);
  if (!importRecord) return null;

  const activeTab = (tabParam as Tab) || "extra";
  const showActions = canReview(session);
  const canDelete = canDeleteImports(session);

  const all = importRecord.tournaments;
  const extraPlay = all.filter(
    (t) => schedulingCategory(t.scheduling) === "extra"
  );
  const withRebuy = all.filter((t) => t.rebuy === true);
  const played = all.filter(
    (t) => schedulingCategory(t.scheduling) === "played"
  );
  const missed = all.filter(
    (t) => schedulingCategory(t.scheduling) === "missed"
  );

  const activeTournaments =
    activeTab === "extra"
      ? extraPlay
      : activeTab === "rebuy"
        ? withRebuy
        : activeTab === "played"
          ? played
          : missed;

  return {
    importId: id,
    importRecord,
    activeTab,
    showActions,
    canDelete,
    extraPlay,
    withRebuy,
    played,
    missed,
    activeTournaments,
  };
}
