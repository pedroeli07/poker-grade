import type { GradeType, PlayerStatus, Prisma } from "@prisma/client";
import { playerProfileInclude } from "@/lib/constants";
import type { EntityRef, WithIdAndStatus, BaseEntity } from "./primitives";

export type PlayerNameFields = {
  name: string;
  nickname: string | null;
  email: string | null;
};

type PlayerNickRow = { network: string; nick: string };

type PlayerNameStatus = WithIdAndStatus<PlayerStatus> & PlayerNameFields & { playerGroup: string | null };

export type PlayerTableRow = PlayerNameStatus & {
  coachKey: string;
  coachLabel: string;
  gradeKey: string;
  gradeLabel: string;
  abiKey: string;
  abiLabel: string;
  abiNumericValue: number | null;
  abiUnit: string | null;
  roiTenDay: number | null;
  fpTenDay: number | null;
  ftTenDay: number | null;
  nicks: PlayerNickRow[];
};

export type PlayerRowInput = PlayerNameStatus & {
  coachId: string | null;
  coach: { name: string } | null;
  gradeAssignments: Array<{ gradeProfile: EntityRef }>;
  nicks: PlayerNickRow[];
};

export type PlayerProfileRecord = Prisma.PlayerGetPayload<{ include: typeof playerProfileInclude }>;

export type PlayerProfileViewModel = {
  player: PlayerProfileRecord;
  assignmentsByType: Record<GradeType, PlayerProfileRecord["gradeAssignments"][number] | undefined>;
  onTrackCount: number;
  attentionCount: number;
  offTrackCount: number;
  canManage: boolean;
};

export type PlayerProfileLoadResult =
  | { status: "not_found" }
  | { status: "forbidden" }
  | { status: "ok"; data: PlayerProfileViewModel };

export interface Nick extends BaseEntity {
  nick: string;
  network: string;
  isActive: boolean;
}
