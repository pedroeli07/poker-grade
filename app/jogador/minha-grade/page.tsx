import { requireSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createLogger } from "@/lib/logger";
import { MinhaGradeAccountPending } from "@/components/minha-grade/minha-grade-account-pending";
import { loadMinhaGradePageData, loadGradeDetailClientProps } from "@/lib/data/grades";
import { minhaGradePageMetadata } from "@/lib/constants/metadata";
import { UserRole } from "@prisma/client";
import GradeDetailClient from "@/app/admin/grades/perfis/[id]/grade-detail-client";
import { cardClassName } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const session = await requireSession();
  if (session.role !== UserRole.PLAYER || !session.playerId) return minhaGradePageMetadata;
  const data = await loadMinhaGradePageData(session.playerId);
  const gradeName = data?.mainGrade?.name;
  if (!gradeName) return minhaGradePageMetadata;
  return { title: `${gradeName} | Minha grade`, description: minhaGradePageMetadata.description };
}

const log = createLogger("minha-grade.page");

export default async function MinhaGradePage() {
  const session = await requireSession();

  log.info("Acesso a Minha Grade", {
    userId: session.userId,
    role: session.role,
    playerId: session.playerId ?? "none",
  });

  if (session.role !== UserRole.PLAYER as UserRole) {
    log.warn("Acesso negado - role nao e PLAYER", { role: session.role, userId: session.userId });
    redirect("/admin/dashboard");
  }

  if (!session.playerId) {
    log.warn("PLAYER sem playerId vinculado", { userId: session.userId });
    return <MinhaGradeAccountPending />;
  }

  const data = await loadMinhaGradePageData(session.playerId);
  if (!data) redirect("/jogador/dashboard");

  const { mainGrade } = data;
  if (!mainGrade) {
    return (
      <div className={`${cardClassName} mx-auto max-w-2xl rounded-xl p-8 text-center`}>
        <h1 className="text-2xl font-bold text-primary">Nenhuma grade atribuída</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você ainda não possui uma grade principal. Fale com seu coach.
        </p>
      </div>
    );
  }

  const props = await loadGradeDetailClientProps(session, mainGrade.id);
  if (!props) redirect("/jogador/dashboard");

  return (
    <GradeDetailClient
      gradeId={props.gradeId}
      initialData={props.initialData}
      backHref="/jogador/dashboard"
      readOnly
    />
  );
}
