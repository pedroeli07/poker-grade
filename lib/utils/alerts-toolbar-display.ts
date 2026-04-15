import { ALERT_TYPE_LABEL } from "@/lib/constants/sharkscope/alerts/alerts-messages";

const SEVERITY_LABEL: Record<string, string> = {
  all: "Todas",
  red: "Vermelho",
  yellow: "Amarelo",
  green: "Verde",
};

const ACK_LABEL: Record<string, string> = {
  all: "Todos",
  unacknowledged: "Não reconhecidos",
  acknowledged: "Reconhecidos",
};

/** Por defeito: severidade e tipo “todos”, reconhecimento “não reconhecidos”. */
export function alertsHasActiveView(filters: {
  severity: string;
  type: string;
  ack: string;
}): boolean {
  return (
    filters.severity !== "all" ||
    filters.type !== "all" ||
    filters.ack !== "unacknowledged"
  );
}

export function buildAlertsFilterSummaryLines(filters: {
  severity: string;
  type: string;
  ack: string;
}): string[] {
  const lines: string[] = [];
  if (filters.severity !== "all") {
    lines.push(`Severidade: ${SEVERITY_LABEL[filters.severity] ?? filters.severity}`);
  }
  if (filters.type !== "all") {
    lines.push(`Tipo: ${ALERT_TYPE_LABEL[filters.type as keyof typeof ALERT_TYPE_LABEL] ?? filters.type}`);
  }
  if (filters.ack !== "unacknowledged") {
    lines.push(`Reconhecimento: ${ACK_LABEL[filters.ack] ?? filters.ack}`);
  }
  return lines;
}
