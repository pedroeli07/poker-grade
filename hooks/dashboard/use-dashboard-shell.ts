"use client";

import { useSidebarStore } from "@/lib/stores/use-sidebar-store";
import { cn } from "@/lib/utils";

export function useDashboardShellLayout() {
  const isOpen = useSidebarStore((s) => s.isOpen);
  return {
    mainClassName: cn(
      "flex-1 flex flex-col transition-all duration-300",
      isOpen ? "ml-[220px]" : "ml-[68px]"
    ),
  };
}
