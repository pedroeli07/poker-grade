"use client";

import { memo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import Link from "next/link";
import { useNotificationStore } from "@/lib/stores/use-notification-store";
import { getUnreadCount } from "@/app/dashboard/notifications/actions";
import { cn } from "@/lib/utils";

function CurrentTimeDisplay() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return <div className="h-10 w-48 animate-pulse bg-muted rounded-md" />;
  }

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

function Topbar() {
  const pathname = usePathname();
  const { unreadCount, setUnreadCount, toggle } = useNotificationStore();

  useEffect(() => {
    getUnreadCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, [pathname, setUnreadCount]);

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

        {/* User Avatar */}
        <Link
          href="/dashboard/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer ml-1 font-semibold"
          title="Meu Perfil"
        >
          <User className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}

export default memo(Topbar);
