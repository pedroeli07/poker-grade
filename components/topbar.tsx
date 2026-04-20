"use client";

import { memo, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import Link from "next/link";
import { useNotificationStore } from "@/lib/stores/use-notification-store";
import { getUnreadCount } from "@/lib/queries/db/notification";
import {
  TOPBAR_AVATAR_ALT,
  TOPBAR_LINK_PROFILE,
  TOPBAR_LOGOUT,
  TOPBAR_NOTIFICATIONS_TITLE,
  TOPBAR_USER_FALLBACK_NAME,
  TOPBAR_USER_MENU_TITLE,
} from "@/lib/constants/topbar";
import { accountProfileHref } from "@/lib/constants/navigation";
import type { UserRole } from "@prisma/client";
import { cn, getUserDisplayInitials } from "@/lib/utils";
import { useTopbarClock } from "@/hooks/use-topbar-clock";

function CurrentTimeDisplay() {
  const { mounted, timeStr, weekdayFormatted, dateStr } = useTopbarClock();

  return (
    <div
      className={cn(
        "flex items-center gap-4 transition-opacity duration-300",
        mounted ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="text-2xl font-black tracking-tight text-primary">{timeStr}</div>
      <div className="h-8 w-[2px] bg-border" />
      <div className="flex flex-col justify-center">
        <span className="text-[13px] font-bold text-foreground uppercase tracking-wide leading-none mb-1.5">
          {weekdayFormatted}
        </span>
        <span className="text-[12px] font-medium text-muted-foreground leading-none">{dateStr}</span>
      </div>
    </div>
  );
}

function Topbar({
  userRole,
  displayName,
  email,
  avatarUrl,
  initialUnreadCount,
}: {
  userRole: UserRole;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  initialUnreadCount: number;
}) {
  const pathname = usePathname();
  const { unreadCount, setUnreadCount, toggle } = useNotificationStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount, setUnreadCount]);

  useEffect(() => {
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    let ignore = false;
    getUnreadCount()
      .then((n) => {
        if (!ignore) setUnreadCount(n);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [pathname, setUnreadCount]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = () => setDropdownOpen(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [dropdownOpen]);

  const initials = getUserDisplayInitials(displayName, email);

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
        <button
          type="button"
          onClick={toggle}
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          title={TOPBAR_NOTIFICATIONS_TITLE}
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

        <div className="relative ml-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-500/50 bg-muted text-foreground hover:bg-muted/80 transition-colors cursor-pointer font-semibold text-sm overflow-hidden"
            title={TOPBAR_USER_MENU_TITLE}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={TOPBAR_AVATAR_ALT} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-background shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-border">
                <p className="font-semibold text-sm text-foreground truncate">
                  {displayName || TOPBAR_USER_FALLBACK_NAME}
                </p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
              <div className="p-1">
                <Link
                  href={accountProfileHref(userRole)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {TOPBAR_LINK_PROFILE}
                </Link>
                <button
                  onClick={handleLogout}
                  className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {TOPBAR_LOGOUT}
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
