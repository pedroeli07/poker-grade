import { getImportDetailForSession } from "@/lib/queries/db/imports";
import type { WithId } from "../primitives";
import { LucideIcon } from "lucide-react";

type Tab = "extra" | "rebuy" | "played" | "missed";

type ImportListRow = WithId & {
  fileName: string;
  playerName: string | null;
  totalRows: number;
  matchedInGrade: number;
  suspect: number;
  outOfGrade: number;
  createdAt: Date | string;
};

type ImportDetailRecord = NonNullable<Awaited<ReturnType<typeof getImportDetailForSession>>>;

type ImportDetailPageData = {
  importId: string;
  importRecord: ImportDetailRecord;
  activeTab: Tab;
  showActions: boolean;
  canDelete: boolean;
  extraPlay: ImportDetailRecord["tournaments"];
  withRebuy: ImportDetailRecord["tournaments"];
  played: ImportDetailRecord["tournaments"];
  missed: ImportDetailRecord["tournaments"];
  activeTournaments: ImportDetailRecord["tournaments"];
};

export type ImportBatchNotifyPayload = {
  fileName: string;
  sheetsProcessed: number;
  totalExtraPlays: number;
  summaryLines: string[];
};

type UploadResult = { processed: number; summary: string[] };

interface ExcelParseResult {
  playerName: string;
  tournaments: ExcelTournamentRow[];
  errors: string[];
  totalRows: number;
}

interface ExcelTournamentRow {
  date: string;
  site: string;
  buyInCurrency: string;
  buyInValue: number;
  buyInUsd: number;
  tournamentName: string;
  scheduling: string;
  rebuy: boolean;
  speed: string;
  sharkId: string;
  priority: string;
}


export type PlayerSelectOption = { id: string; name: string };

type ImportsListPageProps = {
  imports: ImportListRow[];
  canDelete: boolean;
  canImport: boolean;
  players: PlayerSelectOption[];
};

interface ImportsTableRowProps {
  item: ImportListRow;
  canDelete: boolean;
  isSelected: boolean;
  isPending: boolean;
  onToggle: () => void;
  onDeleteRequest: () => void;
}

type ImportDetailTabDef = {
  id: Tab;
  label: string;
  icon: LucideIcon;
  activeCls: string;
  inactiveCls: string;
  countCls: string;
  iconClass: string;
  countNumberClass: string;
  cardActiveClass: string;
};

type ImportDetailTabWithCount = ImportDetailTabDef & { count: number };

type CsvNickRow = { redeRaw: string; jogador: string; appNetwork: string | null };

export type {
  Tab,
  ImportListRow,
  ImportDetailRecord,
  ImportDetailPageData,
  UploadResult,
  ExcelParseResult,
  ExcelTournamentRow,
  ImportsListPageProps,
  ImportsTableRowProps,
  ImportDetailTabDef,
  ImportDetailTabWithCount,
  CsvNickRow,
}