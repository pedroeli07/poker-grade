import { UserRole } from "@prisma/client";
import { requireRoles } from "@/lib/auth/session";
import { getUsuarioDirectoryRows } from "@/lib/data/usuarios-directory";
import { UsuariosClient } from "./usuarios-client";

export const metadata = {
  title: "Usuários | Gestão de Grades",
};

const USUARIOS_VIEW_ROLES = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.COACH,
] as const;

export default async function UsuariosPage() {
  const session = await requireRoles(USUARIOS_VIEW_ROLES);
  const rows = await getUsuarioDirectoryRows();
  const canManageUsers =
    session.role === UserRole.ADMIN || session.role === UserRole.MANAGER;

  return (
    <UsuariosClient initialRows={rows} canManageUsers={canManageUsers} />
  );
}
