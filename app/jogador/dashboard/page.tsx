import { MinhaGradeAccountPending } from "@/components/minha-grade/minha-grade-account-pending";
import { dashboardJogadorPageMetadata } from "@/lib/constants/metadata";
import { loadJogadorDashboardPage } from "@/lib/jogador/jogador-dashboard-page";
import { PlayerDashboardView } from "./dashboard-view";

export const dynamic = "force-dynamic";

export const metadata = dashboardJogadorPageMetadata;

export default async function JogadorDashboardPage() {
  const result = await loadJogadorDashboardPage();
  if (result.kind === "account_pending") {
    return <MinhaGradeAccountPending />;
  }

  const { data, recentTourneys, unreadNotifications } = result;

  return (
    <PlayerDashboardView
      player={data.player}
      assignmentsByType={data.assignmentsByType}
      gradeOrder={data.gradeOrder}
      tourneyStats={data.tourneyStats}
      pendingExtraReviews={data.pendingExtraReviews}
      targetsCount={data.player.targets.length}
      mainGradeName={data.mainGrade?.name ?? null}
      unreadNotifications={unreadNotifications}
      recentTourneys={recentTourneys}
    />
  );
}
