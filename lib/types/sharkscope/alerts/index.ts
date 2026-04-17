import { PlayerRef, WithId } from "../../primitives";
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

export type SharkscopeAlertFilters = {
    severity: Set<string> | null;
    alertType: Set<string> | null;
    ack: Set<string> | null;
    player: Set<string> | null;
    valor: NumberFilterValue | null;
    limite: NumberFilterValue | null;
    data: Set<string> | null;
  };