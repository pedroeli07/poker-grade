import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { requireSession } from "@/lib/auth/session";
import { loadMinhaGradePageData } from "@/lib/data/grades";
import { createLogger } from "@/lib/logger";
import { countUnreadNotificationsForUser } from "@/lib/queries/db/notification-unread-server";
import type { JogadorDashboardPageResult } from "@/lib/types/jogador";
import { loadRecentTourneysForDashboard } from "@/lib/jogador/player-dashboard-data";

const log = createLogger("jogador.dashboard.page");

export async function loadJogadorDashboardPage(): Promise<JogadorDashboardPageResult> {
  const session = await requireSession();

  if (session.role !== (UserRole.PLAYER as UserRole)) {
    redirect("/admin/dashboard");
  }
  if (!session.playerId) {
    log.warn("PLAYER sem playerId vinculado", { userId: session.userId });
    return { kind: "account_pending" };
  }

  const data = await loadMinhaGradePageData(session.playerId);
  if (!data) redirect("/login");

  const [recentTourneys, unreadNotifications] = await Promise.all([
    loadRecentTourneysForDashboard(session.playerId),
    countUnreadNotificationsForUser(session.userId),
  ]);

  return {
    kind: "ok",
    data,
    recentTourneys,
    unreadNotifications,
  };
}
