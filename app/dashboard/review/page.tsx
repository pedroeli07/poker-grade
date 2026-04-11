import dynamicImport from "next/dynamic";
import ReviewPageSkeleton from "@/components/review/review-page-skeleton";
import { requireSession } from "@/lib/auth/session";
import { loadReviewPageData } from "@/hooks/review/review-page-load";
import { reviewPageMetadata } from "@/lib/constants/metadata";

export const metadata = reviewPageMetadata;

export const dynamic = "force-dynamic";

const ReviewPageClient = dynamicImport(() => import("./review-page-client"), {
  loading: () => <ReviewPageSkeleton />,
});

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; player?: string; coach?: string }>;
}) {
  const sp = await searchParams;
  const session = await requireSession();
  const data = await loadReviewPageData(session, sp);

  return <ReviewPageClient {...data} />;
}
