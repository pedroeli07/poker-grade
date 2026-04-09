import { requireSession } from "@/lib/auth/session";
import { Metadata } from "next";
import { loadHistoryPageData } from "../../../hooks/history/history-page-load";
import { HistoryPageView } from "./history-page-view";

export const metadata: Metadata = {
  title: "Histórico de Limites",
  description: "Visualize o histórico de subidas, manutenções e descidas de grade dos jogadores.",
};

export default async function HistoryPage() {
  const session = await requireSession();
  const data = await loadHistoryPageData(session);
  return <HistoryPageView {...data} />;
}
