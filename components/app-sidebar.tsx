"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Grid3X3,
  Upload,
  AlertTriangle,
  Target,
  History,
  UserRoundCog,
  Bell,
  UserCircle,
  LogOut,
  Spade,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/stores/use-sidebar-store";
import { memo } from "react";
import { createLogger } from "@/lib/logger";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { SIDEBAR_NAV_ITEMS, SIDEBAR_SECONDARY_ITEMS } from "@/lib/constants";
import type { UserRole } from "@prisma/client";

const log = createLogger("sidebar");

function isItemActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

const NAV_ICONS: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/players": Users,
  "/dashboard/grades": Grid3X3,
  "/dashboard/imports": Upload,
  "/dashboard/review": AlertTriangle,
  "/dashboard/targets": Target,
  "/dashboard/history": History,
  "/dashboard/usuarios": UserRoundCog,
  "/dashboard/notifications": Bell,
  "/dashboard/profile": UserCircle,
};

function NavItem({
  href,
  title,
  exact,
  isOpen,
  pathname,
}: {
  href: string;
  title: string;
  exact?: boolean;
  isOpen: boolean;
  pathname: string;
}) {
  const active = isItemActive(pathname, href, exact);
  const Icon = NAV_ICONS[href] ?? LayoutDashboard;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl transition-all duration-300 overflow-hidden",
        isOpen ? "px-3 py-2" : "px-0 py-2 justify-center",
        active
          ? "bg-primary/5"
          : "hover:bg-blue-500/30"
      )}
    >
      {/* Active glow bar - left edge */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-primary"
          style={{ height: "55%" }}
        />
      )}

      {/* Active background shimmer */}
      {active && (
        <span className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />
      )}

      {/* Icon container */}
      <span
        className={cn(
          "relative z-10 flex shrink-0 items-center justify-center rounded-lg transition-all duration-300",
          isOpen ? "h-9 w-9" : "h-10 w-10",
          active
            ? "bg-primary/20 text-primary"
            : "bg-blue-500/10 text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
        )}
      >
        <Icon className="h-[17px] w-[17px]" />
      </span>

      {/* Active indicator dot */}
      {active && !isOpen && (
        <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      )}

      {/* Label */}
      {isOpen && (
        <span className="relative z-10 flex flex-1 items-center gap-2 min-w-0">
          <span
            className={cn(
              "text-[16px] font-medium tracking-[-0.01em] truncate transition-colors duration-200",
              active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}
          >
            {title}
          </span>
          {active && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
          )}
        </span>
      )}
    </Link>
  );
}

function AppSidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();
  const router = useRouter();

  // PLAYER sees only their own pages; staff sees everything else
  const navItems =
    userRole === "PLAYER"
      ? SIDEBAR_NAV_ITEMS.filter((item) =>
          ["/dashboard/minha-grade", "/dashboard/history"].includes(item.href)
        )
      : SIDEBAR_NAV_ITEMS.filter((item) => {
          if (item.href === "/dashboard/minha-grade") return false;
          if (item.href === "/dashboard/usuarios")
            return ["ADMIN", "MANAGER", "COACH"].includes(userRole);
          return true;
        });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      toast.success("Sessão encerrada");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Falha ao sair");
    }
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out",
        "bg-blue-500/10 border-r border-sidebar-border",
        isOpen ? "w-[220px]" : "w-[68px]"
      )}
    >
      {/* ── LOGO ── */}
      <div className={cn(
        "flex items-center gap-3 border-b border-sidebar-border transition-all duration-300",
        isOpen ? "h-[64px] px-4" : "h-[64px] justify-center px-0"
      )}>
        {/* Spade logo mark */}
        <div className="relative shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Spade className="h-[18px] w-[18px]" />
          </div>
        </div>

        {isOpen && (
          <>
            <div className="flex flex-col leading-none flex-1">
              <span className="text-[15px] font-black tracking-[0.18em] uppercase text-primary">
                CL
              </span>
              <span className="text-[18px] font-black tracking-tight text-primary leading-tight">
                TEAM
              </span>
            </div>
            <button
              onClick={() => toggle()}
              className="text-muted-foreground/50 hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted/50 shrink-0 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* ── NAV ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-0.5">
        {/* Main section label */}
        {isOpen && (
          <div className="px-3 mb-3">
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted-foreground/60">
              Menu Principal
            </span>
          </div>
        )}

        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            title={item.title}
            exact={"exact" in item ? item.exact : false}
            isOpen={isOpen}
            pathname={pathname}
          />
        ))}

        {/* Divider */}
        <div className="my-2 mx-3 h-px bg-border/50" />

        {isOpen && (
          <div className="px-3 mb-3">
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted-foreground/60">
              Conta
            </span>
          </div>
        )}

        {SIDEBAR_SECONDARY_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            title={item.title}
            isOpen={isOpen}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* ── BOTTOM ── */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        {/* Logout */}
        <button
          onClick={handleLogout}
          type="button"
          className={cn(
            "group w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer",
            "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            !isOpen && "justify-center px-0"
          )}
        >
          <span className="flex shrink-0 h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <LogOut className="h-[16px] w-[16px]" />
          </span>
          {isOpen && (
            <span className="text-[13px] font-medium">Sair</span>
          )}
        </button>

        {/* Toggle button */}
        <button
          onClick={() => {
            toggle();
            log.debug("Sidebar toggled", { isOpen });
          }}
          type="button"
          className={cn(
            "w-full flex items-center justify-center rounded-xl py-2 text-muted-foreground/50",
            "hover:bg-muted/50 hover:text-muted-foreground transition-all duration-200 cursor-pointer"
          )}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}

export default memo(AppSidebar);
