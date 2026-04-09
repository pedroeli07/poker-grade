import { getImportDetailForSession } from "@/lib/queries/db";
import type { WithId } from "./primitives";

export type Tab = "extra" | "rebuy" | "played" | "missed";

export type ImportListRow = WithId & {
  fileName: string;
  playerName: string | null;
  totalRows: number;
  matchedInGrade: number;
  suspect: number;
  outOfGrade: number;
  createdAt: Date | string;
};

export type ImportDetailRecord = NonNullable<Awaited<ReturnType<typeof getImportDetailForSession>>>;

export type ImportDetailPageData = {
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

export type UploadResult = { processed: number; summary: string[] };

export interface ExcelParseResult {
  playerName: string;
  tournaments: ExcelTournamentRow[];
  errors: string[];
  totalRows: number;
}

export interface ExcelTournamentRow {
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
