import { requireSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createLogger } from "@/lib/logger";
import { MinhaGradeHero } from "@/components/minha-grade/minha-grade-hero";
import { MinhaGradeStats } from "@/components/minha-grade/minha-grade-stats";
import { MinhaGradeList } from "@/components/minha-grade/minha-grade-list";
import { MinhaGradeTargets } from "@/components/minha-grade/minha-grade-targets";
import { MinhaGradeLimits } from "@/components/minha-grade/minha-grade-limits";
import { MinhaGradeAccountPending } from "@/components/minha-grade/minha-grade-account-pending";
import { MinhaGradeCoachNote } from "@/components/minha-grade/minha-grade-coach-note";
import { MinhaGradeDetailLink } from "@/components/minha-grade/minha-grade-detail-link";
import { loadMinhaGradePageData } from "@/lib/data/grades";
import { minhaGradePageMetadata } from "@/lib/constants/metadata";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = minhaGradePageMetadata;

const log = createLogger("minha-grade.page");

export default async function MinhaGradePage() {
  const session = await requireSession();

  log.info("Acesso a Minha Grade", {
    userId: session.userId,
    role: session.role,
    playerId: session.playerId ?? "none",
  });

  if (session.role !== UserRole.PLAYER as UserRole) {
    log.warn("Acesso negado - role nao e PLAYER", {
      role: session.role,
      userId: session.userId,
    });
    redirect("/dashboard");
  }

  if (!session.playerId) {
    log.warn("PLAYER sem playerId vinculado", { userId: session.userId });
    return <MinhaGradeAccountPending />;
  }

  const data = await loadMinhaGradePageData(session.playerId);
  if (!data) redirect("/dashboard");

  const { player, tourneyStats, pendingExtraReviews, assignmentsByType, gradeOrder, mainGrade } = data;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <MinhaGradeHero player={player} assignmentsByType={assignmentsByType} gradeOrder={gradeOrder} />

      <MinhaGradeStats
        targetsCount={player.targets.length}
        tourneyStats={tourneyStats}
        pendingExtraReviews={pendingExtraReviews}
      />

      {mainGrade?.description ? <MinhaGradeCoachNote description={mainGrade.description} /> : null}

      <MinhaGradeList gradeOrder={gradeOrder} assignmentsByType={assignmentsByType} />

      <MinhaGradeTargets targets={player.targets} />

      <MinhaGradeLimits limitChanges={player.limitChanges} />

      {mainGrade ? <MinhaGradeDetailLink gradeId={mainGrade.id} /> : null}
    </div>
  );
}
