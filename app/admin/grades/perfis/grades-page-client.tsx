"use client";

import { lazy, memo } from "react";
import type { GradesListPageProps } from "@/lib/types/grade/index";
import { useGradesListPage } from "@/hooks/grades/use-grades-list-page";
import { GradesListInitialEmpty } from "@/components/grades/grades-view-components";

// Lazy-loaded: tabelas / listas pesadas
const GradesListBody = lazy(() => import("@/components/grades/grades-list-body"));
const GradesListToolbar = lazy(() => import("@/components/grades/grades-list-toolbar"));
const GradesPageHeader = lazy(() => import("@/components/grades/grades-page-header"));

const GradesPageClient = memo(function GradesPageClient({ rows: initialRows, manage }: Omit<GradesListPageProps, "players">) {
  const {
    rows,
    view,
    setView,
    viewHydrated,
    filters,
    options,
    filtered,
    anyFilter,
    clearFilters,
    setCol,
  } = useGradesListPage(initialRows);

  return (
    <div className="space-y-6">
      <GradesPageHeader manage={manage} />

      {rows.length === 0 ? (
        <GradesListInitialEmpty />
      ) : !viewHydrated ? (
        <div className="w-full max-w-[1920px] mx-auto space-y-4" aria-busy />
      ) : (
        <div className="w-full max-w-[1920px] mx-auto space-y-4">
          <GradesListToolbar
            view={view}
            setView={setView}
            options={options}
            filters={filters}
            setCol={setCol}
            filteredCount={filtered.length}
            totalCount={rows.length}
            anyFilter={anyFilter}
            clearFilters={clearFilters}
          />
          <GradesListBody
            view={view}
            manage={manage}
            filtered={filtered}
            totalCount={rows.length}
            options={options}
            filters={filters}
            setCol={setCol}
            anyFilter={anyFilter}
            clearFilters={clearFilters}
          />
        </div>
      )}
    </div>
  );
});

GradesPageClient.displayName = "GradesPageClient";

export default GradesPageClient;
