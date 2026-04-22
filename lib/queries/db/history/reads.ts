"use server";

import { requireSession } from "@/lib/auth/session";
import {
  HISTORY_PAGE_SIZE_DEFAULT,
  loadHistoryPageData,
  type HistoryPageData,
} from "@/lib/data/history";

export async function getHistoryPage(
  page = 1,
  pageSize = HISTORY_PAGE_SIZE_DEFAULT
): Promise<HistoryPageData> {
  const session = await requireSession();
  return loadHistoryPageData(session, { page, pageSize });
}
