import { PlayerRef, WithId } from "../../primitives";

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
    severity: string;
    alertType: string;
    ack: string;
  };