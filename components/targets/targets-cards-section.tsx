"use client";

import { memo } from "react";
import { TargetCard } from "@/components/targets/target-card";
import { TargetsEmptyState } from "@/components/targets/targets-view-components";
import type { TargetListRow } from "@/lib/types";

const TargetsCardsSection = memo(function TargetsCardsSection({
  filtered,
  anyFilter,
  onClearFilters,
}: {
  filtered: TargetListRow[];
  anyFilter: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((target) => (
          <div
            key={target.id}
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <TargetCard target={target} />
          </div>
        ))}
        {filtered.length === 0 && (
          <TargetsEmptyState anyFilter={anyFilter} clearFilters={onClearFilters} />
        )}
      </div>
    </div>
  );
});

TargetsCardsSection.displayName = "TargetsCardsSection";

export default TargetsCardsSection;
