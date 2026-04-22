import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@prisma/client";

export type DashboardStats = {
  totalPlayers: number;
  activePlayers: number;
  pendingReviews: number;
  totalTournaments: number;
  inGradePercentage: number;
  suspectCount: number;
  outOfGradeCount: number;
  recentInfractions: number;
};

export type DashboardShellProps = {
  userRole: UserRole;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  initialUnreadCount: number;
};

type NavBase = { title: string; href: string };
export type SidebarIcon = LucideIcon | ComponentType<{ className?: string }>;
export type SidebarNavLink = NavBase & { kind: "link"; icon: SidebarIcon; exact?: boolean };
export type SidebarNavGroupItem = NavBase & { icon: LucideIcon };
export type SidebarNavGroup = {
  kind: "group";
  title: string;
  icon: SidebarIcon;
  items: SidebarNavGroupItem[];
};
export type SidebarNavEntry = SidebarNavLink | SidebarNavGroup;
export type NavItem = NavBase & { icon: SidebarIcon; badge?: number };

export type FilterStore<T> = {
  filters: T;
  setColumnFilter: (key: string, next: Set<string> | null) => void;
  clearFilters: () => void;
  hasAnyFilter: boolean;
};
export type SidebarState = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};
export type TopbarState = {
  titleOverride: string | null;
  setTitle: (title: string | null) => void;
};
