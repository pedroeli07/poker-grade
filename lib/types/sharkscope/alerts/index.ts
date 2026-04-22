import type { PlayerRef, WithId, FilterMap } from "../../primitives";
import type { NumberFilterValue } from "@/lib/number-filter";

export type SharkscopeAlertRow = WithId & {
  playerId: string;
  alertType: string;
  severity: string;
  metricValue: number;
  threshold: number;
  context: unknown;
  triggeredAt: string;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  player: PlayerRef;
};

export type AlertsClientProps = { initialAlerts: SharkscopeAlertRow[]; canAcknowledge: boolean };

type SharkscopeAlertSetFilterKey = "severity" | "alertType" | "ack" | "player" | "data";

export type SharkscopeAlertFilters = FilterMap<SharkscopeAlertSetFilterKey> & {
  valor: NumberFilterValue | null;
  limite: NumberFilterValue | null;
};
