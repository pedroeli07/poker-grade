import { requireSession } from "@/lib/auth/session";
import { HISTORY_PAGE_SIZE_DEFAULT, loadHistoryPageData } from "@/lib/data/history";
import { historyPageMetadata } from "@/lib/constants/metadata";
import HistoryPageClient from "@/app/admin/grades/historico/history-page-client";

export const dynamic = "force-dynamic";

export const metadata = historyPageMetadata;

const ALLOWED_PAGE_SIZES = [5, 10, 25, 50, 100];

function parsePage(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function parsePageSize(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  if (!Number.isFinite(n)) return HISTORY_PAGE_SIZE_DEFAULT;
  const floored = Math.floor(n);
  return ALLOWED_PAGE_SIZES.includes(floored) ? floored : HISTORY_PAGE_SIZE_DEFAULT;
}

export default async function PlayerHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const pageSize = parsePageSize(sp.pageSize);

  const session = await requireSession();
  const data = await loadHistoryPageData(session, { page, pageSize });
  return <HistoryPageClient {...data} />;
}
