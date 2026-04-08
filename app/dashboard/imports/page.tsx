import dynamicImport from "next/dynamic";
import { requireSession } from "@/lib/auth/session";
import { canDeleteImports } from "@/lib/utils";
import { getImportsListRowsForSession } from "@/lib/data/imports-list";
import { NewImportModal } from "@/components/new-import-modal";
import { Metadata } from "next";
import { IMPORT_ROLES } from "@/lib/constants";

const ImportsClient = dynamicImport(
  () => import("./imports-client").then((m) => ({ default: m.ImportsClient })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-full rounded-md bg-muted" />
        <div className="h-72 rounded-lg bg-muted" />
      </div>
    ),
  }
);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Importações",
  description: "Histórico de arquivos de torneios da Lobbyze importados no sistema.",
};

export default async function ImportsPage() {
  const session = await requireSession();
  const imports = await getImportsListRowsForSession(session);
  const canImport = IMPORT_ROLES.includes(session.role);
  const canDelete = canDeleteImports(session);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Importações</h2>
          <p className="text-muted-foreground mt-1">
            Histórico de arquivos de torneios da Lobbyze importados no sistema.
          </p>
        </div>
        {canImport && <NewImportModal />}
      </div>

      <ImportsClient imports={imports} canDelete={canDelete} />
    </div>
  );
}
