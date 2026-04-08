import { Archive } from "lucide-react";
import { canManageGrades } from "@/lib/utils";
import { requireSession } from "@/lib/auth/session";
import { getGradesListRowsForSession } from "@/lib/data/grades-list";
import { NewGradeModal, ImportGradeModal } from "@/components/grade-modals";
import { cardClassName } from "@/lib/constants";
import { Metadata } from "next";
import dynamicImport from "next/dynamic";

const GradesPageClient = dynamicImport(
  () => import("./grades-page-client"),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-12 w-full rounded-md bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    ),
  })


export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Perfis de Grades",
  description: "Gerencie os perfis de grades e filtros da Lobbyze.",
};

export default async function GradesPage() {
  const session = await requireSession();
  const manage = canManageGrades(session);
  const rows = await getGradesListRowsForSession(session);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Grades</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os perfis de grades e filtros da Lobbyze.
          </p>
        </div>
        {manage ? (
          <div className="flex gap-2">
            <ImportGradeModal />
            <NewGradeModal />
          </div>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className={`${cardClassName} py-12 text-center`}>
          <Archive className="h-10 w-10 mx-auto mb-4 opacity-50" />
          <p>Nenhuma grade cadastrada.</p>
          <p className="text-sm">Importe um JSON da Lobbyze para começar.</p>
        </div>
      ) : (
        <GradesPageClient rows={rows} manage={manage} />
      )}
    </div>
  );
}
