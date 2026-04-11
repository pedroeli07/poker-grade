import { requireRoles } from "@/lib/auth/session";
import { getUsuarioDirectoryRows } from "@/lib/data/usuarios-directory";
import UsuariosClient from "./usuarios-client";
import { usuariosPageMetadata } from "@/lib/constants/metadata";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = usuariosPageMetadata;

export default async function UsuariosPage() {
  await requireRoles([UserRole.ADMIN, UserRole.MANAGER, UserRole.COACH]);
  const rows = await getUsuarioDirectoryRows();

  return <UsuariosClient initialRows={rows} />;
}
