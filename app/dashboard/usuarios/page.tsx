import { UserRole } from "@prisma/client";
import { requireRoles } from "@/lib/auth/session";
import { getUsuarioDirectoryRows } from "@/lib/data/usuarios-directory";
import { UsuariosClient } from "./usuarios-client";

export const metadata = {
  title: "Usuários | Gestão de Grades",
};

export default async function UsuariosPage() {
  await requireRoles([UserRole.ADMIN]);

  const rows = await getUsuarioDirectoryRows();

  return <UsuariosClient initialRows={rows} />;
}
