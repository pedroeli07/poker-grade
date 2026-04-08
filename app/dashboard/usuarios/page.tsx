import { requireRoles } from "@/lib/auth/session";
import { getUsuarioDirectoryRows } from "@/lib/data/usuarios-directory";
import { UsuariosClient } from "./usuarios-client";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Usuários",
  description: "Gerencie os usuários do sistema e suas permissões.",
};

export default async function UsuariosPage() {
  const session = await requireRoles(["ADMIN", "MANAGER", "COACH"]);
  const rows = await getUsuarioDirectoryRows();
  const canManageUsers =
    session.role === "ADMIN" || session.role === "MANAGER";

  return (
    <UsuariosClient initialRows={rows} canManageUsers={canManageUsers} />
  );
}
