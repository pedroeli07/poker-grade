"use client";

import { useState, useTransition, useLayoutEffect, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getNotificationsPage,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteSelectedNotifications,
} from "@/lib/queries/db/notification";
import { notificationKeys } from "@/lib/queries/notification-query-keys";
import { useInvalidate } from "@/hooks/use-invalidate";
import { toast } from "@/lib/toast";
import type { NotificationFilterType } from "@/lib/types";
import { NotificationType } from "@prisma/client";
import { NotificationsPageData } from "@/lib/types/index";
import {
  NOTIFICATIONS_LS_FILTER,
  NOTIFICATIONS_LS_PAGE,
  NOTIFICATIONS_LS_PAGE_SIZE,
  NOTIFICATIONS_LS_VIEW_MODE,
} from "@/lib/constants/notification";

/** Alinhado ao `<select>` em `notifications-toolbar` e a `notificationsPageParamsSchema`. */
const NOTIFICATIONS_ALLOWED_PAGE_SIZES = new Set([5, 10, 25, 50, 100, 10_000]);

function normalizeNotificationsPageSize(n: number): number {
  if (!Number.isFinite(n)) return 10;
  const v = Math.floor(n);
  if (NOTIFICATIONS_ALLOWED_PAGE_SIZES.has(v)) return v;
  if (v > 100 && v <= 10_000) return 10_000;
  return 10;
}

export function useNotificationsPage(initialData: NotificationsPageData) {
  const [page, setPage] = useState(initialData.page);
  const [pageSize, setPageSize] = useState(initialData.pageSize || 10);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilters, setTypeFilters] = useState<Set<NotificationType>>(new Set());
  const [searchText, setSearchText] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [isPending, startTransition] = useTransition();
  const invalidateNotifications = useInvalidate("notifications");

  useLayoutEffect(() => {
    try {
      const f = localStorage.getItem(NOTIFICATIONS_LS_FILTER);
      if (f === "all" || f === "unread" || f === "read") setFilter(f);
      const pg = localStorage.getItem(NOTIFICATIONS_LS_PAGE);
      if (pg) {
        const p = parseInt(pg, 10);
        if (!Number.isNaN(p) && p >= 1) setPage(p);
      }
      const pz = localStorage.getItem(NOTIFICATIONS_LS_PAGE_SIZE);
      if (pz) {
        const pzs = parseInt(pz, 10);
        if (!Number.isNaN(pzs)) setPageSize(normalizeNotificationsPageSize(pzs));
      }
      const vm = localStorage.getItem(NOTIFICATIONS_LS_VIEW_MODE);
      if (vm === "cards" || vm === "table") setViewMode(vm);
    } catch {
      /* ignore */
    } finally {
      setStorageHydrated(true);
    }
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      ...notificationKeys.list(page, filter as NotificationFilterType, pageSize),
      Array.from(typeFilters).sort(),
      searchText ?? "",
      dateFrom ?? "",
      dateTo ?? "",
    ],
    queryFn: async () => {
      const r = await getNotificationsPage(
        page,
        filter as NotificationFilterType,
        pageSize,
        Array.from(typeFilters),
        searchText ?? undefined,
        dateFrom,
        dateTo
      );
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
      page === initialData.page &&
      filter === "all" &&
      pageSize === initialData.pageSize &&
      typeFilters.size === 0 &&
      !searchText &&
      !dateFrom &&
      !dateTo
        ? initialData
        : undefined,
    staleTime: 30_000,
  });

  /**
   * Nunca fazer fallback para `initialData` quando página/filtro/tamanho não coincidem com o SSR:
   * com `data` ainda `undefined`, isso mostrava itens da página 1 no lugar da página atual.
   */
  const dataResolved = useMemo((): NotificationsPageData | null => {
    if (data != null) return data;
    if (
      page === initialData.page &&
      filter === "all" &&
      pageSize === initialData.pageSize &&
      typeFilters.size === 0 &&
      !searchText &&
      !dateFrom &&
      !dateTo
    ) {
      return initialData;
    }
    return null;
  }, [data, page, filter, pageSize, typeFilters, searchText, dateFrom, dateTo, initialData]);

  useEffect(() => {
    if (!storageHydrated || dataResolved == null) return;
    const max = Math.max(1, dataResolved.totalPages);
    if (page > max) setPage(max);
  }, [dataResolved, page, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(NOTIFICATIONS_LS_FILTER, filter);
    } catch {
      /* ignore */
    }
  }, [filter, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(NOTIFICATIONS_LS_PAGE, String(page));
    } catch {
      /* ignore */
    }
  }, [page, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(NOTIFICATIONS_LS_PAGE_SIZE, String(pageSize));
    } catch {
      /* ignore */
    }
  }, [pageSize, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(NOTIFICATIONS_LS_VIEW_MODE, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode, storageHydrated]);

  /** Lista: skeleton só até haver payload para o `queryKey` atual (refetch em background mantém a lista). */
  const loading = isLoading;

  function changePage(next: number) {
    if (dataResolved == null) return;
    if (next < 1 || next > dataResolved.totalPages) return;
    setPage(next);
    setSelected(new Set());
  }

  function changePageSize(size: number) {
    setPageSize(normalizeNotificationsPageSize(size));
    setPage(1);
    setSelected(new Set());
  }

  function changeViewMode(mode: "cards" | "table") {
    setViewMode(mode);
  }

  function changeFilter(f: typeof filter) {
    setFilter(f);
    setPage(1);
    setSelected(new Set());
  }

  function changeTypeFilters(next: Set<NotificationType> | null) {
    setTypeFilters(next || new Set());
    setPage(1);
    setSelected(new Set());
  }

  function changeSearchText(next: string | null) {
    setSearchText(next && next.length ? next : null);
    setPage(1);
    setSelected(new Set());
  }

  function changeDateRange(next: { dateFrom: string | null; dateTo: string | null }) {
    setDateFrom(next.dateFrom);
    setDateTo(next.dateTo);
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
    if (dataResolved == null) return;
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

  function handleDelete(id: string, onSuccess?: () => void) {
    startTransition(async () => {
      const r = await deleteNotification(id);
      if (!r.ok) {
        toast.error("Erro", r.error);
        return;
      }
      invalidateNotifications();
      onSuccess?.();
    });
  }

  function handleDeleteSelected(onSuccess?: () => void) {
    const ids = Array.from(selected);
    startTransition(async () => {
      const r = await deleteSelectedNotifications(ids);
      if (!r.ok) {
        toast.error("Erro", r.error);
        return;
      }
      invalidateNotifications();
      setSelected(new Set());
      onSuccess?.();
    });
  }

  const allSelected =
    dataResolved != null &&
    selected.size === dataResolved.items.length &&
    dataResolved.items.length > 0;

  return {
    page,
    pageSize,
    filter,
    typeFilters,
    searchText,
    dateFrom,
    dateTo,
    viewMode,
    selected,
    dataResolved,
    loading,
    error,
    changePage,
    changePageSize,
    changeFilter,
    changeTypeFilters,
    changeSearchText,
    changeDateRange,
    changeViewMode,
    toggleSelect,
    toggleAll,
    handleMarkRead,
    handleMarkAllRead,
    handleDelete,
    handleDeleteSelected,
    allSelected,
    isPending,
  };
}
