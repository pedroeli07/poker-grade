import { requireSession } from "@/lib/auth/session";
import { Metadata } from "next";
import { loadReviewPageData } from "../../../hooks/review/review-page-load";
import { ReviewPageView } from "./review-page-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conferência de Torneios",
  description: "Torneios extra-play e suspeitos aguardando decisão do coach.",
};

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; player?: string; coach?: string }>;
}) {
  const sp = await searchParams;
  const session = await requireSession();
  const data = await loadReviewPageData(session, sp);

  return <ReviewPageView {...data} />;
}
