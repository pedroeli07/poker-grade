export const INVITE_ONLY_MSG =
  "Este e-mail não está autorizado a criar conta. Solicite um convite ao administrador.";

const ALERT_TYPE_ROWS = [
  ["roi_drop", "Queda de ROI"],
  ["reentry_high", "Reentrada Alta"],
  ["abi_deviation", "Desvio de ABI"],
  ["high_variance", "Alta Variância"],
  ["low_volume", "Baixo Volume"],
  ["early_finish", "Finalização Precoce Alta"],
  ["late_finish", "Finalização Tardia Baixa"],
  ["group_not_found", "Grupo Shark não encontrado"],
] as const;

export const ALERT_TYPE_LABEL: Record<string, string> = Object.fromEntries(ALERT_TYPE_ROWS);

const SEVERITY_ROWS = [
  ["red", "Vermelho", "bg-red-500/10 text-red-600 border-red-500/20", "text-red-500"],
  ["yellow", "Amarelo", "bg-amber-500/10 text-amber-600 border-amber-500/20", "text-amber-500"],
  ["green", "Verde", "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", "text-emerald-500"],
] as const;

export const SEVERITY_UI: Record<string, { label: string; badge: string; iconClass: string }> =
  Object.fromEntries(
    SEVERITY_ROWS.map(([key, label, badge, iconClass]) => [key, { label, badge, iconClass }]),
  );
