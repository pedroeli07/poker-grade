"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNotificationStore } from "@/lib/stores/use-notification-store";
import { cn } from "@/lib/utils";
import {
  getNotificationsPage,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteSelectedNotifications,
} from "@/app/dashboard/notifications/actions";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Upload,
  AlertTriangle,
  Target,
  Grid3X3,
  Users,
  TrendingUp,
  Info,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import type { NotificationType } from "@prisma/client";

// ── Types ──────────────────────────────────────────────────────────────────

type NotifItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
};

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string }
> = {
  GRADE_ASSIGNED: { icon: Grid3X3, color: "text-primary", bg: "bg-primary/10" },
  GRADE_CREATED: { icon: Grid3X3, color: "text-blue-500", bg: "bg-blue-500/10" },
  IMPORT_DONE: { icon: Upload, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  EXTRA_PLAY: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  REVIEW_DECISION: { icon: Check, color: "text-violet-500", bg: "bg-violet-500/10" },
  PLAYER_CREATED: { icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  LIMIT_CHANGED: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  SYSTEM: { icon: Info, color: "text-muted-foreground", bg: "bg-muted" },
};

const TYPE_LABELS: Record<NotificationType, string> = {
  GRADE_ASSIGNED: "Grade",
  GRADE_CREATED: "Grade",
  IMPORT_DONE: "Importação",
  EXTRA_PLAY: "Extra Play",
  REVIEW_DECISION: "Revisão",
  PLAYER_CREATED: "Jogador",
  LIMIT_CHANGED: "Limite",
  SYSTEM: "Sistema",
};

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}min`;
  if (h < 24) return `${h}h`;
  if (d === 1) return "ontem";
  return format(new Date(date), "dd/MM", { locale: ptBR });
}

// ── Sheet Component ─────────────────────────────────────────────────────────

export function NotificationSheet() {
  const { open, setOpen, setUnreadCount } = useNotificationStore();

  const [items, setItems] = useState<NotifItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  const load = useCallback(
    async (p = page, f = filter) => {
      setLoading(true);
      try {
        const data = await getNotificationsPage(p, f);
        setItems(data.items as NotifItem[]);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setUnreadCount(data.unreadCount);
      } finally {
        setLoading(false);
      }
    },
    [page, filter, setUnreadCount]
  );

  useEffect(() => {
    if (open) {
      setPage(1);
      load(1, filter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filter]);

  function handlePageChange(next: number) {
    if (next < 1 || next > totalPages) return;
    setPage(next);
    load(next, filter);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleAll() {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(
        Math.max(
          0,
          items.filter((n) => !n.read && n.id !== id).length
        )
      );
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteNotification(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
      setTotal((prev) => prev - 1);
      setSelected((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    });
  }

  function handleDeleteSelected() {
    const ids = Array.from(selected);
    startTransition(async () => {
      await deleteSelectedNotifications(ids);
      setItems((prev) => prev.filter((n) => !ids.includes(n.id)));
      setTotal((prev) => prev - ids.length);
      setSelected(new Set());
    });
  }

  const unreadInPage = items.filter((n) => !n.read).length;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={() => setOpen(false)}
      />

      {/* Sheet */}
      <aside className="fixed right-0 top-0 z-50 h-screen w-[440px] max-w-[95vw] flex flex-col bg-background border-l border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Notificações</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Acompanhe as atividades recentes
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30">
          <span className="text-sm text-muted-foreground">
            {filter === "all" ? "Todas" : filter === "unread" ? "Não lidas" : "Lidas"}{" "}
            <span className="text-foreground font-semibold">({total})</span>
          </span>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 text-sm font-semibold hover:bg-destructive/20 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir ({selected.size})
              </button>
            )}
            {unreadInPage > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 px-6 py-2.5 border-b border-border">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                filter === f
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {f === "all" ? "Todas" : f === "unread" ? "Não lidas" : "Lidas"}
            </button>
          ))}
          {/* Select all */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAll}
              className={cn(
                "flex items-center gap-1.5 text-sm transition-colors cursor-pointer",
                selected.size === items.length && items.length > 0
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                  selected.size === items.length && items.length > 0
                    ? "bg-primary border-primary"
                    : "border-border"
                )}
              >
                {selected.size === items.length && items.length > 0 && (
                  <Check className="h-2.5 w-2.5 text-white" />
                )}
              </div>
              <span className="text-xs font-medium">Selecionar tudo</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              Carregando...
            </div>
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
                  <div
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-3 px-5 py-4 transition-colors group",
                      !notif.read && "bg-primary/[0.03]",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelect(notif.id)}
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer",
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-border hover:border-primary/60"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </button>

                    {/* Icon */}
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        cfg.bg
                      )}
                    >
                      <Icon className={cn("h-4 w-4", cfg.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className={cn(
                                "text-sm font-semibold",
                                notif.read ? "text-muted-foreground" : "text-foreground"
                              )}
                            >
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-[13px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={cn(
                                "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                                cfg.bg,
                                cfg.color
                              )}
                            >
                              {TYPE_LABELS[notif.type]}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {timeAgo(notif.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Row actions */}
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notif.read && (
                            <button
                              type="button"
                              onClick={() => handleMarkRead(notif.id)}
                              title="Marcar como lida"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {notif.link && (
                            <Link
                              href={notif.link}
                              onClick={() => setOpen(false)}
                              title="Abrir"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(notif.id)}
                            title="Excluir"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: pagination + link */}
        <div className="border-t border-border px-6 py-4 space-y-3">
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-muted-foreground font-medium">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <Link
            href="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-full py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Ver todas as notificações
          </Link>
        </div>
      </aside>
    </>
  );
}
