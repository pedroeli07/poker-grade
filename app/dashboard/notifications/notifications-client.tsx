"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { NotificationsPageData } from "@/lib/types";
import { TYPE_CONFIG } from "@/lib/constants";
import { useNotificationsPage } from "../../../hooks/notification/use-notifications-page";

export function NotificationsClient({ initialData }: { initialData: NotificationsPageData }) {
  const {
    filter,
    selected,
    dataResolved,
    loading,
    error,
    changePage,
    changeFilter,
    toggleSelect,
    toggleAll,
    handleMarkRead,
    handleMarkAllRead,
    handleDelete,
    handleDeleteSelected,
    allSelected,
  } = useNotificationsPage(initialData);

  if (error) {
    return (
      <div className="text-center py-16 text-destructive text-sm">
        {error instanceof Error ? error.message : "Erro ao carregar notificações."}
      </div>
    );
  }

  const unreadCount = dataResolved.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-primary">Notificações</h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe as atividades recentes da clínica
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-[15px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 py-3 border-y border-border">
        {/* Select all */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAll}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer",
              allSelected
                ? "bg-primary border-primary"
                : "border-border hover:border-primary/60"
            )}
          >
            {allSelected && <Check className="h-3 w-3 text-white" />}
          </button>
          <span className="text-sm text-muted-foreground font-medium">
            Itens por página:
          </span>
          <span className="text-sm font-semibold text-foreground">10</span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 ml-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => changeFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                filter === f
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              )}
            >
              {f === "all" ? "Todas" : f === "unread" ? "Não lidas" : "Lidas"}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bulk delete */}
        {selected.size > 0 && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-semibold hover:bg-destructive/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Excluir ({selected.size})
          </button>
        )}

        {/* Pagination summary */}
        <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            Página {dataResolved.page} de {dataResolved.totalPages} ({dataResolved.total}{" "}
            itens)
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={dataResolved.page === 1}
              onClick={() => changePage(dataResolved.page - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              type="button"
              disabled={dataResolved.page === dataResolved.totalPages}
              onClick={() => changePage(dataResolved.page + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : dataResolved.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl text-muted-foreground">
          <Bell className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-semibold text-foreground/60">
            Nenhuma notificação
          </p>
          <p className="text-sm mt-1">
            {filter === "unread"
              ? "Todas as notificações foram lidas."
              : "Sem notificações no momento."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {dataResolved.items.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type];
              const Icon = cfg.icon;
              const isSelected = selected.has(notif.id);

              return (
                <div
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-4 px-6 py-5 transition-colors group hover:bg-muted/30",
                    !notif.read && "bg-primary/2.5",
                    isSelected && "bg-primary/5"
                  )}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(notif.id)}
                    className={cn(
                      "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-border hover:border-red-500/60"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </button>

                  {/* Icon */}
                  <div
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      cfg.bg
                    )}
                  >
                    <Icon className={cn("h-5 w-5", cfg.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={cn(
                              "text-[15px] font-semibold",
                              notif.read ? "text-foreground/70" : "text-foreground"
                            )}
                          >
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={cn(
                              "text-xs font-semibold px-2.5 py-1 rounded-full",
                              cfg.bg,
                              cfg.color
                            )}
                          >
                            {cfg.label}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            🕐{" "}
                            {format(new Date(notif.createdAt), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {notif.link && (
                          <Link
                            href={notif.link}
                            title="Abrir"
                            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-40 group-hover:opacity-100"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        {!notif.read && (
                          <button
                            type="button"
                            title="Marcar como lida"
                            onClick={() => handleMarkRead(notif.id)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer opacity-40 group-hover:opacity-100"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Excluir"
                          onClick={() => handleDelete(notif.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-40 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
