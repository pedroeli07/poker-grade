import PaginationToolbarControls from "@/components/data-table/pagination-toolbar-controls";
import type { PlayerTourneysTableApi } from "@/hooks/use-player-tourneys-table";
import { memo } from "react";

const PlayerTourneysPaginationBar = memo(function PlayerTourneysPaginationBar({
  table: t,
}: {
  table: PlayerTourneysTableApi;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 sm:gap-6">
      <PaginationToolbarControls
        page={t.page}
        pageSize={t.pageSize}
        total={t.filtered.length}
        totalPages={t.totalPages}
        onChangePage={t.setPage}
        onChangePageSize={(s) => {
          t.setPageSize(s);
          t.setPage(1);
        }}
      />
    </div>
  );
});

PlayerTourneysPaginationBar.displayName = "PlayerTourneysPaginationBar";

export default PlayerTourneysPaginationBar;
