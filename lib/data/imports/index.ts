import { requireSession } from "@/lib/auth/session";
import { getImportDetailForSession, getImportsForSession } from "@/lib/queries/db/imports/reads";
import { canDeleteImports, canReview } from "@/lib/utils/auth-permissions";
import { schedulingCategory } from "@/lib/utils/player";
import { ImportDetailPageData, ImportListRow, Tab } from "@/lib/types/imports/index";
import { AppSession } from "@/lib/types/auth";
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

const VALID_TABS = new Set<Tab>(["extra", "rebuy", "played", "missed"]);

function parseTab(tabParam?: string): Tab {
  if (tabParam && VALID_TABS.has(tabParam as Tab)) return tabParam as Tab;
  return "extra";
}

export async function loadImportDetailPageData(
  session: AppSession,
  id: string,
  tabParam?: string
): Promise<ImportDetailPageData | null> {
  const importRecord = await getImportDetailForSession(session, id);
  if (!importRecord) return null;

  const activeTab = parseTab(tabParam);
  const showActions = canReview(session);
  const canDelete = canDeleteImports(session);

  const all = importRecord.tournaments;
  const extraPlay = all.filter((t) => schedulingCategory(t.scheduling) === "extra");
  const withRebuy = all.filter((t) => t.rebuy === true);
  const played = all.filter((t) => schedulingCategory(t.scheduling) === "played");
  const missed = all.filter((t) => schedulingCategory(t.scheduling) === "missed");

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

export async function getImportDetailPageProps(id: string, tabParam?: string) {
  const session = await requireSession();
  return loadImportDetailPageData(session, id, tabParam);
}
