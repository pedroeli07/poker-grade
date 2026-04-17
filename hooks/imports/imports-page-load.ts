import type { AppSession } from "@/lib/types";
import { IMPORT_ROLES } from "@/lib/constants";
import { getImportsListRowsForSession } from "@/lib/data/imports";
import { canDeleteImports } from "@/lib/utils";
import type { ImportsListPageProps } from "@/lib/types";

export async function loadImportsListPageProps(
  session: AppSession
): Promise<ImportsListPageProps> {
  const imports = await getImportsListRowsForSession(session);
  return {
    imports,
    canDelete: canDeleteImports(session),
    canImport: IMPORT_ROLES.includes(session.role),
  };
}
