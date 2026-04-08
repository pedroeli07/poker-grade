export const ALERT_TYPE_LABEL: Record<string, string> = {
  roi_drop: "Queda de ROI",
  reentry_high: "Reentrada Alta",
  abi_deviation: "Desvio de ABI",
  high_variance: "Alta Variância",
  low_volume: "Baixo Volume",
  early_finish: "Finalização Precoce Alta",
  late_finish: "Finalização Tardia Baixa",
};

export const SEVERITY_UI: Record<
  string,
  { label: string; badge: string; iconClass: string }
> = {
  red: {
    label: "Vermelho",
    badge: "bg-red-500/10 text-red-600 border-red-500/20",
    iconClass: "text-red-500",
  },
  yellow: {
    label: "Amarelo",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    iconClass: "text-amber-500",
  },
  green: {
    label: "Verde",
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    iconClass: "text-emerald-500",
  },
};
