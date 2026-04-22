"use client";

import { memo, type ReactNode } from "react";
import AppSidebar from "@/components/app-sidebar";
import Topbar from "@/components/topbar";
import NotificationSheet from "@/components/notification-sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { DashboardShellProps } from "@/lib/types/dashboard/index";
import { useDashboardShellLayout } from "@/hooks/dashboard/use-dashboard-shell";
import { cn } from "@/lib/utils/cn";
const DashboardShell = memo(({
  children,
  userRole,
  displayName,
  email,
  avatarUrl,
  initialUnreadCount,
}: DashboardShellProps & { children: ReactNode }) => {
  const { mainClassName } = useDashboardShellLayout();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-background text-foreground">
        <AppSidebar userRole={userRole} />

        <main className={cn(mainClassName, "min-w-0")}>
          <Topbar
            userRole={userRole}
            displayName={displayName}
            email={email}
            avatarUrl={avatarUrl}
            initialUnreadCount={initialUnreadCount}
          />
          <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-pattern animate-fade-in">
            <div className="w-full min-w-0 max-w-full">
              {children}
            </div>
          </div>
        </main>

        <NotificationSheet userRole={userRole} />
      </div>
    </TooltipProvider>
  );
});

DashboardShell.displayName = "DashboardShell";

export default DashboardShell;
