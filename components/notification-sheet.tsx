"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useNotificationStore } from "@/lib/stores/use-notification-store";
import { cn, timeAgo } from "@/lib/utils";
import {
  getNotificationsPage,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteSelectedNotifications,
} from "@/lib/queries/db/notification";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";
import { notificationKeys } from "@/lib/queries/notification-query-keys";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { NotificationFilterType } from "@/lib/types";
import { STALE_TIME, TYPE_CONFIG, TYPE_LABELS } from "@/lib/constants";

export function NotificationSheet() {
  const { open, setOpen, setUnreadCount } = useNotificationStore();
  const invalidateNotifications = useInvalidate("notifications");

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const setFilterAndReset = useCallback((f: "all" | "unread" | "read") => {
    setFilter(f);
    setPage(1);
    setSelected(new Set());
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- reset de paginação ao abrir o painel */
  useEffect(() => {
    if (open) {
      setPage(1);
      setSelected(new Set());
    }
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const { data, isLoading } = useQuery({
    queryKey: notificationKeys.list(page, filter as NotificationFilterType),
    queryFn: async () => {
      const res = await getNotificationsPage(page, filter as NotificationFilterType);
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    enabled: open,
    staleTime: STALE_TIME,
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const loading = isLoading || isPending;
  const unreadInPage = items.filter((n) => !n.read).length;

  // Sync unread count to global store for the topbar bell icon
  useEffect(() => {
    if (data?.unreadCount !== undefined) {
      setUnreadCount(data.unreadCount);
    }
  }, [data?.unreadCount, setUnreadCount]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function toggleAll() {
    setSelected(selected.size === items.length && items.length > 0 ? new Set() : new Set(items.map((i) => i.id)));
  }

  function runAction(action: () => Promise<{ ok?: boolean; error?: string }>, onSuccess?: () => void) {
    startTransition(async () => {
      const r = await action();
      if (!r.ok) toast.error("Erro", r.error);
      else {
        invalidateNotifications();
        onSuccess?.();
      }
    });
  }

  function handleMarkRead(id: string) {
    runAction(() => markNotificationRead(id));
  }

  function handleMarkAllRead() {
    runAction(() => markAllNotificationsRead());
  }

  function handleDelete(id: string) {
    runAction(() => deleteNotification(id), () => {
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    });
  }

  function handleDeleteSelected() {
    runAction(() => deleteSelectedNotifications(Array.from(selected)), () => setSelected(new Set()));
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={() => setOpen(false)} />

      <aside className="fixed right-0 top-0 z-50 h-screen w-[440px] max-w-[95vw] flex flex-col bg-background border-l border-border shadow-2xl">
        <div className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Notificações</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Acompanhe as atividades recentes</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30">
          <span className="text-sm text-muted-foreground">
            {filter === "all" ? "Todas" : filter === "unread" ? "NÃ£o lidas" : "Lidas"} <span className="text-foreground font-semibold">({total})</span>
          </span>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <button type="button" onClick={handleDeleteSelected} disabled={isPending} className="flex items-center gap-1.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 text-sm font-semibold hover:bg-destructive/20 transition-colors cursor-pointer disabled:opacity-50">
                <Trash2 className="h-3.5 w-3.5" /> Excluir ({selected.size})
              </button>
            )}
            {unreadInPage > 0 && (
              <button type="button" onClick={handleMarkAllRead} disabled={isPending} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50">
                <CheckCheck className="h-3.5 w-3.5" /> Marcar todas
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 px-6 py-2.5 border-b border-border">
          {(["all", "unread", "read"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilterAndReset(f)} className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer", filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              {f === "all" ? "Todas" : f === "unread" ? "NÃ£o lidas" : "Lidas"}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={toggleAll} className={cn("flex items-center gap-1.5 text-sm transition-colors cursor-pointer", selected.size === items.length && items.length > 0 ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <div className={cn("h-4 w-4 rounded border flex items-center justify-center transition-colors", selected.size === items.length && items.length > 0 ? "bg-primary border-primary" : "border-border")}>
                {selected.size === items.length && items.length > 0 && <Check className="h-2.5 w-2.5 text-white" />}
              </div>
              <span className="text-xs font-medium">Selecionar tudo</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((notif) => {
                const cfg = TYPE_CONFIG[notif.type];
                const Icon = cfg.icon;
                const isSelected = selected.has(notif.id);

                return (
                  <div key={notif.id} className={cn("flex items-start gap-3 px-5 py-4 transition-colors group", !notif.read && "bg-primary/[0.03]", isSelected && "bg-primary/5")}>
                    <button type="button" onClick={() => toggleSelect(notif.id)} className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer", isSelected ? "bg-primary border-primary" : "border-border hover:border-primary/60")}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </button>
                    <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", cfg.bg)}>
                      <Icon className={cn("h-4 w-4", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={cn("text-sm font-semibold", notif.read ? "text-muted-foreground" : "text-foreground")}>{notif.title}</p>
                            {!notif.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                          </div>
                          <p className="text-[13px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", cfg.bg, cfg.color)}>{TYPE_LABELS[notif.type]}</span>
                            <span className="text-[11px] text-muted-foreground">{timeAgo(notif.createdAt as Date)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notif.read && (
                            <button type="button" onClick={() => handleMarkRead(notif.id)} disabled={isPending} title="Marcar como lida" className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer disabled:opacity-50"><Check className="h-3.5 w-3.5" /></button>
                          )}
                          {notif.link && (
                            <Link href={notif.link} onClick={() => setOpen(false)} title="Abrir" className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><ExternalLink className="h-3.5 w-3.5" /></Link>
                          )}
                          <button type="button" onClick={() => handleDelete(notif.id)} disabled={isPending} title="Excluir" className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-4 space-y-3">
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
              <span className="text-muted-foreground font-medium">{page} / {totalPages}</span>
              <button type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
          <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="flex items-center justify-center w-full py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors">Ver todas as notificações</Link>
        </div>
      </aside>
    </>
  );
}
