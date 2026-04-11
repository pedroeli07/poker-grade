"use client";

import { memo } from "react";
import type { GradesListPageProps } from "@/lib/types";
import { GradesListInitialEmpty } from "@/components/grades/grades-view-components";
import GradesPageHeader from "@/components/grades/grades-page-header";
import GradesListToolbar from "@/components/grades/grades-list-toolbar";
import GradesListBody from "@/components/grades/grades-list-body";
import { useGradesListPage } from "@/hooks/grades/use-grades-list-page";

const GradesPageClient = memo(function GradesPageClient({ rows: initialRows, manage }: GradesListPageProps) {
  const {
    rows,
    view,
    setView,
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
