"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Spade, ChevronLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/stores/use-sidebar-store";
import { memo, useEffect, useMemo, useState } from "react";
import {
  SIDEBAR_NAV_ITEMS,
  SIDEBAR_SECONDARY_ITEMS,
} from "@/lib/constants";
import type { SidebarIcon, SidebarNavEntry, SidebarNavGroup } from "@/lib/types";
import type { UserRole } from "@prisma/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function isItemActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function filterNavForRole(
  items: SidebarNavEntry[],
  userRole: UserRole
): SidebarNavEntry[] {
  if (userRole === "PLAYER") {
    return items.filter(
      (item): item is Extract<SidebarNavEntry, { kind: "link" }> =>
        item.kind === "link" &&
        ["/dashboard/minha-grade", "/dashboard/history"].includes(item.href)
    );
  }
  return items.filter((item) => {
    if (item.kind === "link") {
      if (item.href === "/dashboard/minha-grade") return false;
      if (item.href === "/dashboard/users") {
        return ["ADMIN", "MANAGER", "COACH"].includes(userRole);
      }
      return true;
    }
    return true;
  });
}

function NavItem({
  href,
  title,
  icon: Icon,
  exact,
  isOpen,
  pathname,
  nested,
}: {
  href: string;
  title: string;
  icon: SidebarIcon;
  exact?: boolean;
  isOpen: boolean;
  pathname: string;
  nested?: boolean;
}) {
  const active = isItemActive(pathname, href, exact);

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl transition-all duration-300 overflow-hidden",
        isOpen ? "px-3 py-2" : "px-0 py-2 justify-center",
        nested && isOpen && "pl-1",
        active ? "bg-primary/5" : "hover:bg-blue-500/30"
      )}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-primary"
          style={{ height: "55%" }}
        />
      )}

      {active && (
        <span className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />
      )}

      <span
        className={cn(
          "relative z-10 flex shrink-0 items-center justify-center rounded-lg transition-all duration-300",
          isOpen ? "h-9 w-9" : "h-10 w-10",
          nested && isOpen && "h-8 w-8",
          active
            ? "bg-primary/20 text-primary"
            : "bg-blue-500/10 text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
        )}
      >
        <Icon className={cn(nested && isOpen ? "h-4 w-4" : "h-[17px] w-[17px]")} />
      </span>

      {active && !isOpen && (
        <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      )}

      {isOpen && (
        <span className="relative z-10 flex flex-1 items-center gap-2 min-w-0">
          <span
            className={cn(
              "text-[16px] font-medium tracking-[-0.01em] truncate transition-colors duration-200",
              nested && "text-[14px]",
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

function SharkScopeNavGroup({
  group,
  isOpen,
  pathname,
}: {
  group: SidebarNavGroup;
  isOpen: boolean;
  pathname: string;
}) {
  const anyChildActive = group.items.some((i) => isItemActive(pathname, i.href));
  const [expanded, setExpanded] = useState(anyChildActive);

  /* eslint-disable react-hooks/set-state-in-effect -- expandir grupo quando uma rota filha fica ativa */
  useEffect(() => {
    if (anyChildActive) setExpanded(true);
  }, [anyChildActive]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const GroupIcon = group.icon;

  if (!isOpen) {
    return (
      <>
        {group.items.map((child) => (
          <NavItem
            key={child.href}
            href={child.href}
            title={child.title}
            icon={child.icon}
            isOpen={false}
            pathname={pathname}
          />
        ))}
      </>
    );
  }

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all duration-300 overflow-hidden text-left",
            anyChildActive ? "bg-primary/5" : "hover:bg-blue-500/30"
          )}
        >
          {anyChildActive && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-primary"
              style={{ height: "55%" }}
            />
          )}
          <span
            className={cn(
              "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
              anyChildActive
                ? "bg-primary/20 text-primary"
                : "bg-blue-500/10 text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
            )}
          >
            <GroupIcon className="h-[17px] w-[17px]" />
          </span>
          <span className="relative z-10 flex flex-1 items-center gap-2 min-w-0">
            <span
              className={cn(
                "text-[16px] font-medium tracking-[-0.01em] truncate",
                anyChildActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            >
              {group.title}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pt-0.5 pl-2 ml-5 border-l border-primary/15">
        {group.items.map((child) => (
          <NavItem
            key={child.href}
            href={child.href}
            title={child.title}
            icon={child.icon}
            isOpen={isOpen}
            pathname={pathname}
            nested
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function AppSidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();

  const navItems = useMemo(
    () => filterNavForRole(SIDEBAR_NAV_ITEMS, userRole),
    [userRole]
  );

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out",
        "bg-blue-500/10 border-r border-sidebar-border",
        isOpen ? "w-[220px]" : "w-[68px]"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-b border-sidebar-border transition-all duration-300",
          isOpen ? "h-[64px] px-4" : "h-[64px] justify-center px-0"
        )}
      >
        {isOpen ? (
          <>
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Spade className="h-[18px] w-[18px]" />
              </div>
            </div>
            <div className="flex flex-col leading-none flex-1">
              <span className="text-[15px] font-black tracking-[0.18em] uppercase text-primary">
                CL
              </span>
              <span className="text-[18px] font-black tracking-tight text-primary leading-tight">
                TEAM
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggle()}
              aria-label="Recolher menu"
              className="bg-blue-500/20 hover:bg-blue-500/30 text-muted-foreground/80 hover:text-foreground transition-colors p-1.5 rounded-md  shrink-0 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => toggle()}
            aria-label="Expandir menu"
            className="relative shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary/15 cursor-pointer"
          >
            <Spade className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      <nav
        className={cn(
          "sidebar-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-0.5"
        )}
      >
        {isOpen && (
          <div className="px-3 mb-3">
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted-foreground/60">
              Menu Principal
            </span>
          </div>
        )}

        {navItems.map((item) =>
          item.kind === "link" ? (
            <NavItem
              key={item.href}
              href={item.href}
              title={item.title}
              icon={item.icon}
              exact={item.exact}
              isOpen={isOpen}
              pathname={pathname}
            />
          ) : (
            <SharkScopeNavGroup
              key={item.title}
              group={item}
              isOpen={isOpen}
              pathname={pathname}
            />
          )
        )}

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
            icon={item.icon}
            isOpen={isOpen}
            pathname={pathname}
          />
        ))}
      </nav>
    </aside>
  );
}

export default memo(AppSidebar);
