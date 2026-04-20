import { requireSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createLogger } from "@/lib/logger";
import { UserRole } from "@prisma/client";
import { MinhaGradeAccountPending } from "@/components/minha-grade/minha-grade-account-pending";
import { loadMinhaGradePageData } from "@/lib/data/grades";
import { prisma } from "@/lib/prisma";
import { countUnreadNotificationsForUser } from "@/lib/queries/db/notification-unread-server";
import { PlayerDashboardView } from "./dashboard-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Início | Jogador",
  description: "Resumo da sua grade, torneios, metas e notificações.",
};

const log = createLogger("jogador.dashboard.page");

export default async function JogadorDashboardPage() {
  const session = await requireSession();

  if (session.role !== UserRole.PLAYER as UserRole) {
    redirect("/admin/dashboard");
  }
  if (!session.playerId) {
    log.warn("PLAYER sem playerId vinculado", { userId: session.userId });
    return <MinhaGradeAccountPending />;
  }

  const data = await loadMinhaGradePageData(session.playerId);
  if (!data) redirect("/login");

  const [recentTourneys, unreadNotifications] = await Promise.all([
    prisma.playedTournament.findMany({
      where: { playerId: session.playerId },
      orderBy: { date: "desc" },
      take: 5,
      select: {
        id: true,
        date: true,
        tournamentName: true,
        site: true,
        buyInCurrency: true,
        buyInValue: true,
        scheduling: true,
      },
    }),
    countUnreadNotificationsForUser(session.userId),
  ]);

  return (
    <PlayerDashboardView
      player={data.player}
      assignmentsByType={data.assignmentsByType}
      gradeOrder={data.gradeOrder}
      tourneyStats={data.tourneyStats}
      pendingExtraReviews={data.pendingExtraReviews}
      targetsCount={data.player.targets.length}
      mainGradeId={data.mainGrade?.id ?? null}
      mainGradeName={data.mainGrade?.name ?? null}
      unreadNotifications={unreadNotifications}
      recentTourneys={recentTourneys.map((t) => ({
        id: t.id,
        date: t.date,
        tournamentName: t.tournamentName,
        site: t.site,
        buyInCurrency: t.buyInCurrency,
        buyInValue: t.buyInValue,
        scheduling: t.scheduling,
      }))}
    />
  );
}
