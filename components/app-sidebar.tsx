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
  index,
  isOpen,
  pathname,
}: {
  href: string;
  title: string;
  exact?: boolean;
  index: number;
  isOpen: boolean;
  pathname: string;
}) {
  const active = isItemActive(pathname, href, exact);
  const Icon = NAV_ICONS[href] ?? LayoutDashboard;
  const num = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl transition-all duration-300 overflow-hidden",
        isOpen ? "px-3 py-3" : "px-0 py-3 justify-center",
        active
          ? "bg-primary/8"
          : "hover:bg-white/[0.03]"
      )}
    >
      {/* Active glow bar - left edge */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-primary"
          style={{
            height: "55%",
            boxShadow: "0 0 12px 2px oklch(0.63 0.24 25 / 60%)",
          }}
        />
      )}

      {/* Active background shimmer */}
      {active && (
        <span className="absolute inset-0 bg-linear-to-r from-primary/12 via-primary/5 to-transparent pointer-events-none" />
      )}

      {/* Icon container */}
      <span
        className={cn(
          "relative z-10 flex shrink-0 items-center justify-center rounded-lg transition-all duration-300",
          isOpen ? "h-9 w-9" : "h-10 w-10",
          active
            ? "bg-primary/15 text-primary"
            : "bg-white/[0.04] text-muted-foreground group-hover:bg-white/[0.07] group-hover:text-foreground/80"
        )}
      >
        <Icon className="h-[17px] w-[17px]" />
      </span>

      {/* Label + number */}
      {isOpen && (
        <span className="relative z-10 flex flex-1 items-center justify-between min-w-0">
          <span
            className={cn(
              "text-[13.5px] font-medium tracking-[-0.01em] truncate transition-colors duration-200",
              active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              "text-[10px] font-bold tabular-nums transition-all duration-300",
              active ? "text-primary/70" : "text-muted-foreground/30 group-hover:text-muted-foreground/50"
            )}
          >
            {num}
          </span>
        </span>
      )}
    </Link>
  );
}

function AppSidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();
  const router = useRouter();

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
        "bg-[oklch(0.085_0.005_260)] border-r",
        "border-white/[0.05]",
        isOpen ? "w-[220px]" : "w-[68px]"
      )}
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, oklch(0.63 0.24 25 / 8%) 0%, transparent 60%)
        `,
      }}
    >
      {/* Top red accent line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/4 bg-linear-to-r from-transparent via-primary/50 to-transparent"
      />

      {/* ── LOGO ── */}
      <div className={cn(
        "flex items-center gap-3 border-b border-white/[0.05] transition-all duration-300",
        isOpen ? "h-[64px] px-4" : "h-[64px] justify-center px-0"
      )}>
        {/* Spade logo mark */}
        <div className="relative shrink-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15"
            style={{ boxShadow: "0 0 20px oklch(0.63 0.24 25 / 20%), inset 0 1px 0 oklch(1 0 0 / 5%)" }}
          >
            <Spade className="h-[18px] w-[18px] text-primary" />
          </div>
        </div>

        {isOpen && (
          <div className="flex flex-col leading-none">
            <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground/60">
              Gestão de
            </span>
            <span className="text-[16px] font-black tracking-tight text-foreground leading-tight">
              Grades
            </span>
          </div>
        )}
      </div>

      {/* ── NAV ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-1">
        {/* Main section label */}
        {isOpen && (
          <div className="px-3 mb-3">
            <span className="text-[9.5px] font-bold tracking-[0.22em] uppercase text-muted-foreground/40">
              Menu Principal
            </span>
          </div>
        )}

        {SIDEBAR_NAV_ITEMS.map((item, i) => (
          <NavItem
            key={item.href}
            href={item.href}
            title={item.title}
            exact={"exact" in item ? item.exact : false}
            index={i}
            isOpen={isOpen}
            pathname={pathname}
          />
        ))}

        {/* Divider */}
        <div className="my-4 mx-3 h-px bg-white/[0.05]" />

        {isOpen && (
          <div className="px-3 mb-3">
            <span className="text-[9.5px] font-bold tracking-[0.22em] uppercase text-muted-foreground/40">
              Conta
            </span>
          </div>
        )}

        {SIDEBAR_SECONDARY_ITEMS.map((item, i) => (
          <NavItem
            key={item.href}
            href={item.href}
            title={item.title}
            index={SIDEBAR_NAV_ITEMS.length + i}
            isOpen={isOpen}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* ── BOTTOM ── */}
      <div className="border-t border-white/[0.05] p-2 space-y-1">
        {/* Logout */}
        <button
          onClick={handleLogout}
          type="button"
          className={cn(
            "group w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer",
            "text-muted-foreground hover:bg-primary/8 hover:text-primary",
            !isOpen && "justify-center px-0"
          )}
        >
          <span className="flex shrink-0 h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] group-hover:bg-primary/10 transition-colors">
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
            "w-full flex items-center justify-center rounded-xl py-2 text-muted-foreground/40",
            "hover:bg-white/[0.04] hover:text-muted-foreground transition-all duration-200 cursor-pointer"
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
