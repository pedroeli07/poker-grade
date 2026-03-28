import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  DollarSign,
  User,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { requireSession } from "@/lib/auth/session";
import { canReview } from "@/lib/auth/rbac";
import { getPendingReviewsForSession } from "@/lib/data/queries";
import { ReviewDecisionButtons } from "@/components/review-decision-buttons";
import Link from "next/link";
import {
  ReviewPlayerSelect,
  ReviewPagination,
} from "./review-filters";

const PLAYERS_PER_PAGE = 5;

type ReviewItem = Awaited<ReturnType<typeof getPendingReviewsForSession>>[number];

function groupByPlayer(reviews: ReviewItem[]) {
  const map = new Map<
    string,
    { player: ReviewItem["player"]; reviews: ReviewItem[] }
  >();
  for (const r of reviews) {
    const pid = r.player.id;
    if (!map.has(pid)) map.set(pid, { player: r.player, reviews: [] });
    map.get(pid)!.reviews.push(r);
  }
  return Array.from(map.values()).sort(
    (a, b) => b.reviews.length - a.reviews.length
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function avatarColor() {
  return "bg-primary/15 text-primary";
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; player?: string }>;
}) {
  const sp = await searchParams;
  const session = await requireSession();
  const pendingReviews = await getPendingReviewsForSession(session);
  const showActions = canReview(session);
  const groups = groupByPlayer(pendingReviews);

  const playerIdParam = typeof sp.player === "string" ? sp.player : undefined;
  const validIds = new Set(groups.map((g) => g.player.id));
  const filterPlayerId =
    playerIdParam && validIds.has(playerIdParam) ? playerIdParam : null;

  const pageRaw = parseInt(sp.page ?? "1", 10);
  const pageRequested = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

  const filteredGroups = filterPlayerId
    ? groups.filter((g) => g.player.id === filterPlayerId)
    : groups;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGroups.length / PLAYERS_PER_PAGE)
  );
  const page = Math.min(pageRequested, totalPages);
  const start = (page - 1) * PLAYERS_PER_PAGE;
  const paginatedGroups = filteredGroups.slice(
    start,
    start + PLAYERS_PER_PAGE
  );

  const pendingInView = paginatedGroups.reduce(
    (n, g) => n + g.reviews.length,
    0
  );
  const totalFilteredPending = filteredGroups.reduce(
    (n, g) => n + g.reviews.length,
    0
  );

  const playerOptions = [...groups]
    .sort((a, b) => a.player.name.localeCompare(b.player.name, "pt-BR"))
    .map((g) => ({
      id: g.player.id,
      name: g.player.name,
      extraPlayCount: g.reviews.length,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Conferência de Torneios
          </h2>
          <p className="text-muted-foreground mt-1">
            Torneios extra-play e suspeitos aguardando decisão do coach.
          </p>
        </div>
        {pendingReviews.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-600">
              {filterPlayerId
                ? `${totalFilteredPending} pendente${totalFilteredPending !== 1 ? "s" : ""} (${groups.find((g) => g.player.id === filterPlayerId)?.player.name ?? ""})`
                : `${pendingReviews.length} pendente${pendingReviews.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        )}
      </div>

      {pendingReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mb-4 text-emerald-500/40" />
          <p className="font-medium text-foreground/70">Tudo em dia!</p>
          <p className="text-sm mt-1">
            Nenhum torneio pendente de revisão no momento.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-primary/10 shadow-sm transition-all hover:border-primary/20 group">
            <ReviewPlayerSelect
              playerOptions={playerOptions}
              playerId={filterPlayerId}
            />
            <div className="flex items-center gap-4 shrink-0 transition-opacity">
              <p className="text-sm font-medium text-muted-foreground mr-2">
                {pendingInView} torneio{pendingInView !== 1 ? "s" : ""}
                {!filterPlayerId && totalFilteredPending !== pendingInView && (
                  <span className="opacity-60">
                    {" "}({totalFilteredPending} total)
                  </span>
                )}
              </p>
              <ReviewPagination
                playerId={filterPlayerId}
                page={page}
                totalPages={totalPages}
              />
            </div>
          </div>

          {paginatedGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
              Nenhum jogador nesta página.
            </div>
          ) : (
            <div className="space-y-6 mt-2">
                {paginatedGroups.map(({ player, reviews }) => (
                  <div
                    key={player.id}
                    className="rounded-xl border border-border overflow-hidden bg-blue-500/5 shadow-sm"
                  >
                    <div className="flex items-center gap-4 px-5 py-4 bg-primary/10 border-b border-border/60">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor()}`}
                      >
                        {initials(player.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Link
                            href={`/dashboard/players/${player.id}`}
                            className="font-semibold text-lg text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                          >
                            {player.name}
                            <ExternalLink className="h-4 w-4 opacity-40" />
                          </Link>
                          <Badge
                            variant="outline"
                            className="border-red-500/30 text-red-500 bg-red-500/10 text-sm px-2.5"
                          >
                            {reviews.length} extra play
                            {reviews.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[15px] text-muted-foreground mt-1">
                          <User className="h-4 w-4" />
                          Coach:{" "}
                          <span className="text-foreground/70">
                            {player.coach?.name ?? "Sem coach"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-border/60">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="flex items-center gap-5 px-6 py-4 bg-white hover:bg-blue-100/5 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <p
                                className="text-[15px] font-semibold line-clamp-1 max-w-[420px]"
                                title={review.tournament.tournamentName}
                              >
                                {review.tournament.tournamentName}
                              </p>
                              {review.tournament.matchStatus === "SUSPECT" ? (
                                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/25 border text-xs px-2">
                                  Suspeito
                                </Badge>
                              ) : (
                                <Badge className="bg-red-500/10 text-red-500 border-red-500/25 border text-xs px-2">
                                  <ShieldAlert className="h-3 w-3 mr-1" />
                                  Extra Play
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground/80">
                                {review.tournament.site}
                              </span>
                              <span className="opacity-40">·</span>
                              <span>
                                {format(review.tournament.date, "dd/MM HH:mm")}
                              </span>
                              {review.tournament.speed && (
                                <>
                                  <span className="opacity-40">·</span>
                                  <span>{review.tournament.speed}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-right min-w-[80px]">
                            <div className="flex items-center justify-end gap-1 font-mono text-[17px] font-bold text-foreground/90">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              {review.tournament.buyInValue.toFixed(2)}
                            </div>
                            <p className="text-xs font-medium text-muted-foreground mt-0.5">
                              buy-in
                            </p>
                          </div>

                          {showActions ? (
                            <div className="shrink-0">
                              <ReviewDecisionButtons reviewId={review.id} />
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground shrink-0">
                              —
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
