import { requireSession } from "@/lib/auth/session";
import { loadHistoryPageData, parseHistoryRoutePage, parseHistoryRoutePageSize } from "@/lib/data/history";
import { historyPageMetadata } from "@/lib/constants/metadata";
import HistoryPageClient from "@/app/admin/grades/historico/history-page-client";

export const dynamic = "force-dynamic";

export const metadata = historyPageMetadata;

export default async function PlayerHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const sp = await searchParams;
  const page = parseHistoryRoutePage(sp.page);
  const pageSize = parseHistoryRoutePageSize(sp.pageSize);

  const session = await requireSession();
  const data = await loadHistoryPageData(session, { page, pageSize });
  return <HistoryPageClient {...data} />;
}
