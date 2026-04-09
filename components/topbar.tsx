"use client";

import { memo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import Link from "next/link";
import { useNotificationStore } from "@/lib/stores/use-notification-store";
import { getUnreadCount } from "@/lib/queries/db/notification-queries";
import { cn } from "@/lib/utils";

function CurrentTimeDisplay() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(time);

  const weekdayStr = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
  }).format(time);

  const dateStr = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(time);

  const weekdayFormatted = weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1);

  return (
    <div className="flex items-center gap-4 animate-fade-in">
      <div className="text-2xl font-black tracking-tight text-primary">
        {timeStr}
      </div>
      <div className="h-8 w-[2px] bg-border" />
      <div className="flex flex-col justify-center">
        <span className="text-[13px] font-bold text-foreground uppercase tracking-wide leading-none mb-1.5">
          {weekdayFormatted}
        </span>
        <span className="text-[12px] font-medium text-muted-foreground leading-none">
          {dateStr}
        </span>
      </div>
    </div>
  );
}

function Topbar({
  displayName,
  email,
}: {
  displayName: string | null;
  email: string;
}) {
  const pathname = usePathname();
  const { unreadCount, setUnreadCount, toggle } = useNotificationStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    getUnreadCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, [pathname, setUnreadCount]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = () => setDropdownOpen(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [dropdownOpen]);

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : email?.[0]?.toUpperCase() ?? "?";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <header 
      className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-blue-500/10 backdrop-blur-md px-6"
    >
      <div className="flex flex-1 items-center gap-4">
        <CurrentTimeDisplay />
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          type="button"
          onClick={toggle}
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          title="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold",
                unreadCount > 9 && "w-auto px-1.5"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar with Dropdown */}
        <div className="relative ml-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer font-semibold text-sm"
            title="Menu do usuário"
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-background shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-border">
                <p className="font-semibold text-sm text-foreground truncate">
                  {displayName || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {email}
                </p>
              </div>
              <div className="p-1">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Meu Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default memo(Topbar);
