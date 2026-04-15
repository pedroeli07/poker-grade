import { requireRoles } from "@/lib/auth/session";
import { getUsuarioDirectoryRows } from "@/lib/data/usuarios-directory";
import UsuariosClient from "./usuarios-client";
import { usuariosPageMetadata } from "@/lib/constants/metadata";
import { USUARIOS_PAGE_ALLOWED_ROLES } from "@/lib/constants/usuarios/usuarios-page";

export const dynamic = "force-dynamic";

export const metadata = usuariosPageMetadata;

export default async function UsuariosPage() {
  await requireRoles(USUARIOS_PAGE_ALLOWED_ROLES);
  const rows = await getUsuarioDirectoryRows();

  return <UsuariosClient initialRows={rows} />;
}
