"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Upload,
  AlertTriangle,
  Target,
  Users,
  Grid3X3,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType = "info" | "success" | "warning" | "import" | "target" | "review";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string; border: string }
> = {
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  success: { icon: Check, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  import: { icon: Upload, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  target: { icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  review: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  return `${days}d atrás`;
}

type FilterType = "all" | "unread" | "read";

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteSelected = () => {
    setNotifications((prev) => prev.filter((n) => !selected.has(n.id)));
    setSelected(new Set());
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: "Todas", value: "all" },
    { label: "Não lidas", value: "unread" },
    { label: "Lidas", value: "read" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notificações</h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe todas as atualizações e alertas do sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="border-border hover:bg-sidebar-accent"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
          {selected.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={deleteSelected}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir ({selected.size})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
              filter === f.value
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground border border-transparent"
            )}
          >
            {f.label}
            {f.value === "unread" && unreadCount > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground text-[10px] h-5 min-w-5 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <Card className="glass-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Nenhuma notificação</p>
              <p className="text-sm mt-1">
                {filter === "unread"
                  ? "Todas as notificações foram lidas."
                  : "Você ainda não recebeu notificações."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((notification, index) => {
                const config = TYPE_CONFIG[notification.type];
                const Icon = config.icon;
                const isSelected = selected.has(notification.id);

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-4 p-4 sm:p-5 transition-all duration-200 hover:bg-sidebar-accent/30 group",
                      !notification.read && "bg-primary/3",
                      isSelected && "bg-primary/5",
                      `animate-fade-in`
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelect(notification.id)}
                      className={cn(
                        "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>

                    {/* Icon */}
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        config.bg,
                        config.border,
                        "border"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={cn(
                                "text-sm font-medium truncate",
                                !notification.read
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="flex h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_6px] shadow-primary/50" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      {/* Actions */}
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification.id)}
                          className="mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
