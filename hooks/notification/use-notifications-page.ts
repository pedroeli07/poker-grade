"use client";

import { useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getNotificationsPage,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteSelectedNotifications,
} from "@/lib/queries/db/notification-queries";
import { notificationKeys } from "@/lib/queries/notification-query-keys";
import { useInvalidate } from "@/hooks/use-invalidate";
import { toast } from "@/lib/toast";
import type { NotificationFilterType } from "@/lib/types";
import { NotificationsPageData } from "@/lib/types/index";

export function useNotificationsPage(initialData: NotificationsPageData) {
  const [page, setPage] = useState(initialData.page);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const invalidateNotifications = useInvalidate("notifications");

  const { data, isFetching, error } = useQuery({
    queryKey: notificationKeys.list(page, filter as NotificationFilterType),
    queryFn: async () => {
      const r = await getNotificationsPage(page, filter as NotificationFilterType);
      if (!r.ok) throw new Error(r.error);
      return {
        items: r.items,
        total: r.total,
        unreadCount: r.unreadCount,
        page: r.page,
        pageSize: r.pageSize,
        totalPages: r.totalPages,
      } satisfies NotificationsPageData;
    },
    initialData:
      page === initialData.page && filter === "all" ? initialData : undefined,
    staleTime: 30_000,
  });

  const dataResolved = data ?? initialData;
  const loading = isFetching;

  function changePage(next: number) {
    if (next < 1 || next > dataResolved.totalPages) return;
    setPage(next);
    setSelected(new Set());
  }

  function changeFilter(f: typeof filter) {
    setFilter(f);
    setPage(1);
    setSelected(new Set());
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function toggleAll() {
    if (selected.size === dataResolved.items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(dataResolved.items.map((i) => i.id)));
    }
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      const r = await markNotificationRead(id);
      if (!r.ok) {
        toast.error("Erro", r.error);
        return;
      }
      invalidateNotifications();
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      const r = await markAllNotificationsRead();
      if (!r.ok) {
        toast.error("Erro", r.error);
        return;
      }
      invalidateNotifications();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const r = await deleteNotification(id);
      if (!r.ok) {
        toast.error("Erro", r.error);
        return;
      }
      invalidateNotifications();
    });
  }

  function handleDeleteSelected() {
    const ids = Array.from(selected);
    startTransition(async () => {
      const r = await deleteSelectedNotifications(ids);
      if (!r.ok) {
        toast.error("Erro", r.error);
        return;
      }
      invalidateNotifications();
    });
  }

  const allSelected =
    selected.size === dataResolved.items.length && dataResolved.items.length > 0;

  return {
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
  };
}
