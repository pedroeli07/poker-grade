"use client";

import { usePathname } from "next/navigation";
import { memo, useMemo, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Bell, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { useTopbarStore } from "@/lib/stores/use-topbar-store";
import { createLogger } from "@/lib/logger";
import { TOPBAR_PAGE_TITLES } from "@/lib/constants";

const log = createLogger("topbar");

function Topbar() {
  const pathname = usePathname();
  const titleOverride = useTopbarStore((s) => s.titleOverride);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const routeTitle = useMemo(() => {
    if (TOPBAR_PAGE_TITLES[pathname]) return TOPBAR_PAGE_TITLES[pathname];

    const match = Object.entries(TOPBAR_PAGE_TITLES).find(([path]) =>
      pathname.startsWith(path + "/")
    );
    return match ? match[1] : "Dashboard";
  }, [pathname]);

  const title = titleOverride ?? routeTitle;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-6">
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors cursor-pointer"
          title="Alternar tema"
        >
          {mounted ? (
            theme === "dark" ? (
              <Moon className="h-[18px] w-[18px]" />
            ) : (
              <Sun className="h-[18px] w-[18px]" />
            )
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </button>

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors cursor-pointer"
          title="Notificações"
        >
          <Bell className="h-[18px] w-[18px]" />
          {/* Notification dot */}
          <span className="notification-dot" />
        </Link>

        {/* User Avatar */}
        <Link
          href="/dashboard/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer ml-1"
          title="Meu Perfil"
        >
          <User className="h-[18px] w-[18px]" />
        </Link>
      </div>
    </header>
  );
}

export default memo(Topbar);
