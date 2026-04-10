import { requireSession } from "@/lib/auth/session";
import { loadImportDetailPageData } from "@/lib/imports/import-detail-page-load";

export async function getImportDetailPageProps(id: string, tabParam?: string) {
  const session = await requireSession();
  return loadImportDetailPageData(session, id, tabParam);
}
