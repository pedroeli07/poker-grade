import { requireRoles } from "@/lib/auth/session";
import { getUserDirectoryRows } from "@/lib/data/user";
import UserClient from "./user-client";
import { usersPageMetadata } from "@/lib/constants/metadata";
import { USERS_PAGE_ALLOWED_ROLES } from "@/lib/constants/users";

export const dynamic = "force-dynamic";

export const metadata = usersPageMetadata;

export default async function UsersPage() {
  await requireRoles(USERS_PAGE_ALLOWED_ROLES);
  const rows = await getUserDirectoryRows();

  return <UserClient initialRows={rows} />;
}
