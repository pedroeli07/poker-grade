import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type SidebarNavLink = {
  kind: "link";
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type SidebarNavGroupItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type SidebarGroupIcon =
  | LucideIcon
  | ComponentType<{ className?: string }>;

export type SidebarNavGroup = {
  kind: "group";
  title: string;
  icon: SidebarGroupIcon;
  items: SidebarNavGroupItem[];
};

export type SidebarNavEntry = SidebarNavLink | SidebarNavGroup;
