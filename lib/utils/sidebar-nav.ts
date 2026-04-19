import { UserRole } from "@prisma/client";
import { STAFF_WRITE_ROLES } from "@/lib/constants/session-rbac";
import { SIDEBAR_PLAYER_LINK_HREFS } from "@/lib/constants/navigation";
import type { SidebarNavEntry } from "@/lib/types";

const PLAYER_SIDEBAR_LINK_HREFS = new Set<string>(SIDEBAR_PLAYER_LINK_HREFS);

export function isSidebarNavItemActive(
  pathname: string,
  href: string,
  exact?: boolean
): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function filterSidebarNavForRole(
  items: SidebarNavEntry[],
  userRole: UserRole
): SidebarNavEntry[] {
  if (userRole === UserRole.PLAYER) {
    return items.filter(
      (item): item is Extract<SidebarNavEntry, { kind: "link" }> =>
        item.kind === "link" && PLAYER_SIDEBAR_LINK_HREFS.has(item.href)
    );
  }
  return items.filter((item) => {
    if (item.kind === "link") {
      if (item.href === "/dashboard/minha-grade") return false;
      if (item.href === "/dashboard/minha-grade/torneios") return false;
      if (item.href === "/dashboard/users") {
        return STAFF_WRITE_ROLES.includes(userRole);
      }
      return true;
    }
    return true;
  });
}
