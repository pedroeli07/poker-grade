"use client";

import AppSidebar from "@/components/app-sidebar";
import Topbar from "@/components/topbar";
import { NotificationSheet } from "@/components/notification-sheet";
import { useSidebarStore } from "@/lib/stores/use-sidebar-store";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { UserRole } from "@prisma/client";

export function DashboardShell({
  children,
  userRole,
  displayName,
  email,
}: {
  children: React.ReactNode;
  userRole: UserRole;
  displayName: string | null;
  email: string;
}) {
  const isOpen = useSidebarStore((s) => s.isOpen);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-background text-foreground">
        <AppSidebar userRole={userRole} />

        <main
          className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            isOpen ? "ml-[220px]" : "ml-[68px]"
          )}
        >
          <Topbar displayName={displayName} email={email} />
          <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-pattern animate-fade-in overflow-x-hidden">
            <div className="w-full">
              {children}
            </div>
          </div>
        </main>

        {/* Notification slide-out sheet */}
        <NotificationSheet />
      </div>
    </TooltipProvider>
  );
}
