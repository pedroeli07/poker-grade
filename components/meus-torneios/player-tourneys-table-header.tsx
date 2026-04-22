import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import SortButton from "@/components/sort-button";
import type { PlayerTourneysTableApi } from "@/hooks/use-player-tourneys-table";
import { memo } from "react";

const PlayerTourneysTableHeader = memo(function PlayerTourneysTableHeader({
  table: t,
}: {
  table: PlayerTourneysTableApi;
}) {
  return (
    <TableHeader>
      <TableRow className="bg-blue-500/15 hover:bg-blue-500/15">
        <TableHead className="w-[150px] whitespace-nowrap">
          <div className="flex items-center gap-0.5">
            <SortButton columnKey="date" sort={t.sort} toggleSort={t.toggleSort} kind="string" label="Data" />
            <ColumnFilter
              columnId="date"
              ariaLabel="Data"
              label={<FilteredColumnTitle active={t.dateFilter !== null}>Data</FilteredColumnTitle>}
              options={t.options.date}
              applied={t.dateFilter}
              onApply={t.setDateFilter}
            />
          </div>
        </TableHead>
        <TableHead className="w-[170px]">
          <div className="flex items-center gap-0.5">
            <SortButton columnKey="site" sort={t.sort} toggleSort={t.toggleSort} kind="string" label="Site" />
            <ColumnFilter
              columnId="site"
              ariaLabel="Site"
              label={<FilteredColumnTitle active={t.siteFilter !== null}>Site</FilteredColumnTitle>}
              options={t.options.site}
              applied={t.siteFilter}
              onApply={t.setSiteFilter}
            />
          </div>
        </TableHead>
        <TableHead className="w-[120px] text-right">
          <div className="flex items-center justify-end gap-0.5">
            <SortButton columnKey="buyIn" sort={t.sort} toggleSort={t.toggleSort} kind="number" label="Buy-In" />
            <ColumnFilter
              columnId="buyIn"
              ariaLabel="Buy-In"
              label={<FilteredColumnTitle active={t.buyInFilter !== null}>Buy-In</FilteredColumnTitle>}
              options={t.options.buyIn}
              applied={t.buyInFilter}
              onApply={t.setBuyInFilter}
            />
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-0.5">
            <SortButton columnKey="tournamentName" sort={t.sort} toggleSort={t.toggleSort} kind="string" label="Torneio" />
            <ColumnFilter
              columnId="tournamentName"
              ariaLabel="Torneio"
              label={<FilteredColumnTitle active={t.tourneyFilter !== null}>Torneio</FilteredColumnTitle>}
              options={t.options.tournamentName}
              applied={t.tourneyFilter}
              onApply={t.setTourneyFilter}
            />
          </div>
        </TableHead>
        <TableHead className="w-[120px] text-center">
          <div className="flex items-center justify-center gap-0.5">
            <SortButton columnKey="scheduling" sort={t.sort} toggleSort={t.toggleSort} kind="string" label="Agenda" />
            <ColumnFilter
              columnId="scheduling"
              ariaLabel="Agenda"
              label={<FilteredColumnTitle active={t.schedulingFilter !== null}>Agenda</FilteredColumnTitle>}
              options={t.options.scheduling}
              applied={t.schedulingFilter}
              onApply={t.setSchedulingFilter}
            />
          </div>
        </TableHead>
        <TableHead className="w-[100px] text-center">
          <div className="flex items-center justify-center gap-0.5">
            <SortButton columnKey="rebuy" sort={t.sort} toggleSort={t.toggleSort} kind="string" label="Reentry" />
            <ColumnFilter
              columnId="rebuy"
              ariaLabel="Reentry"
              label={<FilteredColumnTitle active={t.rebuyFilter !== null}>Reentry</FilteredColumnTitle>}
              options={t.options.rebuy}
              applied={t.rebuyFilter}
              onApply={t.setRebuyFilter}
            />
          </div>
        </TableHead>
        <TableHead className="w-[120px] text-center">
          <div className="flex items-center justify-center gap-0.5">
            <SortButton columnKey="speed" sort={t.sort} toggleSort={t.toggleSort} kind="string" label="Velocidade" />
            <ColumnFilter
              columnId="speed"
              ariaLabel="Velocidade"
              label={<FilteredColumnTitle active={t.speedFilter !== null}>Velocidade</FilteredColumnTitle>}
              options={t.options.speed}
              applied={t.speedFilter}
              onApply={t.setSpeedFilter}
            />
          </div>
        </TableHead>
        <TableHead className="w-[120px] text-center">
          <div className="flex items-center justify-center gap-0.5">
            <SortButton columnKey="sharkId" sort={t.sort} toggleSort={t.toggleSort} kind="string" label="Shark ID" />
            <ColumnFilter
              columnId="sharkId"
              ariaLabel="Shark ID"
              label={<FilteredColumnTitle active={t.sharkIdFilter !== null}>Shark ID</FilteredColumnTitle>}
              options={t.options.sharkId}
              applied={t.sharkIdFilter}
              onApply={t.setSharkIdFilter}
            />
          </div>
        </TableHead>
        <TableHead className="w-[120px] text-center">
          <div className="flex items-center justify-center gap-0.5">
            <SortButton columnKey="priority" sort={t.sort} toggleSort={t.toggleSort} kind="string" label="Prioridade" />
            <ColumnFilter
              columnId="priority"
              ariaLabel="Prioridade"
              label={<FilteredColumnTitle active={t.priorityFilter !== null}>Prioridade</FilteredColumnTitle>}
              options={t.options.priority}
              applied={t.priorityFilter}
              onApply={t.setPriorityFilter}
            />
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
});

PlayerTourneysTableHeader.displayName = "PlayerTourneysTableHeader";

export default PlayerTourneysTableHeader;
