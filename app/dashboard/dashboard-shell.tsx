"use client";

import type { ReactNode } from "react";
import AppSidebar from "@/components/app-sidebar";
import Topbar from "@/components/topbar";
import { NotificationSheet } from "@/components/notification-sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { DashboardShellProps } from "@/lib/types";
import { useDashboardShellLayout } from "@/hooks/dashboard/use-dashboard-shell";

export function DashboardShell({
  children,
  userRole,
  displayName,
  email,
}: DashboardShellProps & { children: ReactNode }) {
  const { mainClassName } = useDashboardShellLayout();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-background text-foreground">
        <AppSidebar userRole={userRole} />

        <main className={mainClassName}>
          <Topbar displayName={displayName} email={email} />
          <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-pattern animate-fade-in overflow-x-hidden">
            <div className="w-full">
              {children}
            </div>
          </div>
        </main>

        <NotificationSheet />
      </div>
    </TooltipProvider>
  );
}
