import type { AppSession } from "@/lib/auth/session";
import { getPendingReviewsForSession } from "@/lib/queries/db";
import {
  PLAYERS_PER_PAGE,
  REVIEW_NO_COACH_SENTINEL,
} from "@/lib/constants";
import { canReview, groupByPlayer } from "@/lib/utils";
import type {
  ReviewPageData,
} from "@/lib/types";


export async function loadReviewPageData(
  session: AppSession,
  sp: { page?: string; player?: string; coach?: string }
): Promise<ReviewPageData> {
  const pendingReviews = await getPendingReviewsForSession(session);
  const showActions = canReview(session);
  const groups = groupByPlayer(pendingReviews);

  const coachIdsInData = new Set(
    groups
      .map((g) => g.player.coach?.id)
      .filter((id): id is string => Boolean(id))
  );
  const hasPlayersWithoutCoach = groups.some((g) => !g.player.coachId);

  const coachParam = typeof sp.coach === "string" ? sp.coach : undefined;
  let filterCoachId: string | null = null;
  if (coachParam === "none" && hasPlayersWithoutCoach) {
    filterCoachId = REVIEW_NO_COACH_SENTINEL;
  } else if (coachParam && coachIdsInData.has(coachParam)) {
    filterCoachId = coachParam;
  }

  const groupsAfterCoach =
    filterCoachId === null
      ? groups
      : filterCoachId === REVIEW_NO_COACH_SENTINEL
        ? groups.filter((g) => !g.player.coachId)
        : groups.filter((g) => g.player.coach?.id === filterCoachId);

  const playerIdParam = typeof sp.player === "string" ? sp.player : undefined;
  const validIds = new Set(groupsAfterCoach.map((g) => g.player.id));
  const filterPlayerId =
    playerIdParam && validIds.has(playerIdParam) ? playerIdParam : null;

  const pageRaw = parseInt(sp.page ?? "1", 10);
  const pageRequested = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

  const filteredGroups = filterPlayerId
    ? groupsAfterCoach.filter((g) => g.player.id === filterPlayerId)
    : groupsAfterCoach;

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

  const coachCountById = new Map<string, number>();
  const coachNameById = new Map<string, string>();
  for (const g of groups) {
    const cid = g.player.coach?.id;
    if (cid) {
      coachCountById.set(cid, (coachCountById.get(cid) ?? 0) + 1);
      coachNameById.set(cid, g.player.coach!.name);
    }
  }
  const coachOptions = [...coachCountById.entries()]
    .map(([id, playerCount]) => ({
      id,
      name: coachNameById.get(id) ?? id,
      playerCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  if (hasPlayersWithoutCoach) {
    coachOptions.push({
      id: REVIEW_NO_COACH_SENTINEL,
      name: "Sem coach",
      playerCount: groups.filter((g) => !g.player.coachId).length,
    });
  }

  const playerOptions = [...groupsAfterCoach]
    .sort((a, b) => a.player.name.localeCompare(b.player.name, "pt-BR"))
    .map((g) => ({
      id: g.player.id,
      name: g.player.name,
      extraPlayCount: g.reviews.length,
    }));

  const filterCoachLabel =
    filterCoachId === REVIEW_NO_COACH_SENTINEL
      ? "Sem coach"
      : filterCoachId
        ? (coachNameById.get(filterCoachId) ?? null)
        : null;

  const filterPlayerName = filterPlayerId
    ? (groups.find((g) => g.player.id === filterPlayerId)?.player.name ?? null)
    : null;

  return {
    pendingReviews,
    showActions,
    coachOptions,
    playerOptions,
    filterCoachId,
    filterPlayerId,
    filterPlayerName,
    page,
    totalPages,
    paginatedGroups,
    pendingInView,
    totalFilteredPending,
    filterCoachLabel,
  };
}
