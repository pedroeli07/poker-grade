import type { PlayerStatus } from "@prisma/client";
import type { PlayerProfileRecord, PlayerTableRow } from "./playerTypes";
import type { PlayersTablePayload } from "./pagePropsTypes";

export type PlayerTableRowActionsProps = {
  player: PlayerTableRow;
  canEditPlayers: boolean;
  onEdit: (p: PlayerTableRow) => void;
};

export type PlayerGroupTableCellProps = {
  playerGroup: string | null;
  sharkGroupNotFound?: boolean;
};

export type PlayerNickItemProps = {
  nick: string;
  network: string;
};

export type PlayerNicksTableCellProps = {
  nicks: PlayerTableRow["nicks"];
};

export type PlayerCoachTableCellProps = {
  coachKey: string;
  coachLabel: string;
};

export type PlayerGradeTableCellProps = {
  gradeKey: string;
  gradeLabel: string;
};

export type PlayerAbiTableCellProps = {
  abiKey: string;
  abiLabel: string;
};

export type PlayerRoiCellProps = {
  roi: number | null;
};

export type PlayerFpTenDayCellProps = {
  value: number | null;
};

export type PlayerFtTenDayCellProps = {
  value: number | null;
};

export type PlayerStatusTableCellProps = {
  status: PlayerStatus;
};

export type PlayerProfileHeaderProps = {
  player: PlayerProfileRecord;
};

export type PlayerProfileSidebarProps = {
  player: PlayerProfileRecord;
};

export type PlayersTableClientProps = {
  initialPayload: PlayersTablePayload;
  canEditPlayers: boolean;
};
