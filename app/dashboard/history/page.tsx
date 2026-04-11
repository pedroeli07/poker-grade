import { requireSession } from "@/lib/auth/session";
import { loadHistoryPageData } from "@/lib/history/history-page-load";
import { historyPageMetadata } from "@/lib/constants/metadata";
import HistoryPageClient from "./history-page-client";

export const dynamic = "force-dynamic";

export const metadata = historyPageMetadata;

export default async function HistoryPage() {
  const session = await requireSession();
  const data = await loadHistoryPageData(session);
  return <HistoryPageClient {...data} />;
}
