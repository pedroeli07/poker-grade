"use client";

import { memo } from "react";
import { format } from "date-fns";
import { Clock, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReviewDecisionButtons } from "@/components/review-decision-buttons";
import { pokerSiteIconFromSiteLabel } from "@/lib/constants/poker-networks";
import type { ReviewItem } from "@/lib/types/review/index";
const PokerSiteInline = memo(function PokerSiteInline({ site }: { site: string }) {
  const icon = pokerSiteIconFromSiteLabel(site);
  return (
    <span className="inline-flex max-w-full items-center gap-2">
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element -- logos em /public
        <img src={icon} alt="" width={20} height={20} className="size-5 shrink-0 rounded object-contain" />
      ) : (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold uppercase text-muted-foreground">
          {site.trim().slice(0, 1)}
        </span>
      )}
      <span className="min-w-0 font-medium text-foreground/85">{site}</span>
    </span>
  );
});

PokerSiteInline.displayName = "PokerSiteInline";

const ReviewTournamentReviewRow = memo(function ReviewTournamentReviewRow({
  review,
  showActions,
}: {
  review: ReviewItem;
  showActions: boolean;
}) {
  const t = review.tournament;
  const currency = t.buyInCurrency ?? "$";

  return (
    <div className="group relative flex flex-col gap-4 border-l-2 border-transparent bg-white px-5 py-4 transition-colors hover:border-primary/25 hover:bg-slate-50/80 sm:flex-row sm:items-start sm:gap-6 sm:px-6">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-border/60 bg-linear-to-b from-muted/60 to-muted/30 px-3 py-2 text-center shadow-sm sm:w-[5.25rem]">
          <span className="font-mono text-lg font-bold leading-none tracking-tight text-foreground tabular-nums">
            {currency}
            {t.buyInValue.toFixed(2)}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">buy-in</span>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <h3
            className="inline-block max-w-full align-top text-[15px] font-semibold leading-snug text-foreground [overflow-wrap:anywhere] sm:text-base"
            title={t.tournamentName}
          >
            <span className="break-words">{t.tournamentName}</span>
            {t.matchStatus === "SUSPECT" ? (
              <Badge className="ml-2 inline-flex align-middle border border-amber-500/25 bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                Suspeito
              </Badge>
            ) : (
              <Badge className="ml-2 inline-flex align-middle border border-rose-500/20 bg-rose-500/[0.08] px-2.5 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                <ShieldAlert className="mr-1 inline h-3 w-3 align-[-0.1em]" />
                Extra Play
              </Badge>
            )}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
            <PokerSiteInline site={t.site} />
            <span className="text-border select-none" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              {format(t.date, "dd/MM HH:mm")}
            </span>
            {t.speed ? (
              <>
                <span className="text-border select-none" aria-hidden>
                  ·
                </span>
                <span className="rounded-md bg-muted/80 px-1.5 py-0.5 text-xs font-medium text-foreground/75">
                  {t.speed}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {showActions ? (
        <div className="shrink-0 border-t border-border/50 pt-3 sm:border-t-0 sm:pt-0 sm:pl-2">
          <ReviewDecisionButtons reviewId={review.id} />
        </div>
      ) : (
        <span className="shrink-0 self-center text-xs text-muted-foreground">—</span>
      )}
    </div>
  );
});

ReviewTournamentReviewRow.displayName = "ReviewTournamentReviewRow";

export default ReviewTournamentReviewRow;
