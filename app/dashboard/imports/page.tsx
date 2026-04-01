import { requireSession } from "@/lib/auth/session";
import { canDeleteImports, IMPORT_ROLES } from "@/lib/auth/rbac";
import { getImportsListRowsForSession } from "@/lib/data/imports-list";
import { NewImportModal } from "@/components/new-import-modal";
import { ImportsClient } from "./imports-client";

export const dynamic = "force-dynamic";

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
