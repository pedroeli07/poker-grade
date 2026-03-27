"use client";

import AppSidebar from "@/components/app-sidebar";
import Topbar from "@/components/topbar";
import { NotificationSheet } from "@/components/notification-sheet";
import { useSidebarStore } from "@/lib/stores/use-sidebar-store";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const isOpen = useSidebarStore((s) => s.isOpen);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isOpen ? "ml-[220px]" : "ml-[68px]"
        )}
      >
        <Topbar />
        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-pattern animate-fade-in">
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Notification slide-out sheet */}
      <NotificationSheet />
    </div>
  );
}
