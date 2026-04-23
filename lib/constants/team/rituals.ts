export type RitualChecklistItem = {
  text: string;
  required: boolean;
  completed?: boolean;
};

export const RITUAL_TYPE_OPTIONS = [
  "WBR",
  "Auditoria D+1",
  "Revisão Mensal",
  "1:1",
  "Aula",
  "Custom",
] as const;

export const RITUAL_AREA_OPTIONS = [
  "Operação",
  "Financeira",
  "Mental",
  "Técnica",
  "Cultura",
] as const;

export const RITUAL_RECURRENCE_OPTIONS = [
  "Não recorrente",
  "Semanal",
  "Quinzenal",
  "Mensal",
  "Custom",
] as const;

export const RITUAL_AREA_COLORS: Record<string, string> = {
  "Operação": "bg-blue-50 text-blue-700 border-blue-200",
  "Financeira": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Mental": "bg-purple-50 text-purple-700 border-purple-200",
  "Técnica": "bg-amber-50 text-amber-700 border-amber-200",
  "Cultura": "bg-rose-50 text-rose-700 border-rose-200",
};

/** Valores alinhados a `Date.getDay()`: 0 = domingo … 6 = sábado. */
export const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
] as const;

/** Picker na ordem Seg → Dom, rótulos curtos (referência visual do modal). */
export const RITUAL_WEEKDAY_PICKER = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
] as const;

export const RITUAL_GENERATE_FOR_OPTIONS = [
  { value: "4", label: "4 semanas" },
  { value: "8", label: "8 semanas" },
  { value: "12", label: "12 semanas" },
] as const;

export const RITUAL_REMINDER_LEAD_OPTIONS = [
  { value: "15min", label: "15 minutos" },
  { value: "1hora", label: "1 hora" },
  { value: "24horas", label: "24 horas" },
] as const;

/** Ordem dos chips em “Templates rápidos” (alinhado ao fluxo do time). */
export const RITUAL_QUICK_TEMPLATE_ORDER = [
  "WBR Semanal",
  "Auditoria D+1",
  "Revisão Mensal",
  "1:1 Individual",
  "Aula",
] as const;

export type RitualQuickTemplateId = (typeof RITUAL_QUICK_TEMPLATE_ORDER)[number];

export type RitualTemplateFields = Partial<{
  name: string;
  ritualType: string;
  area: string;
  description: string;
  durationMin: string;
  recurrence: string;
  checklist: RitualChecklistItem[];
}>;

export const RITUAL_TEMPLATES: Record<RitualQuickTemplateId, RitualTemplateFields> = {
  "WBR Semanal": {
    name: "WBR Semanal",
    ritualType: "WBR",
    area: "Operação",
    description:
      "Weekly Business Review — análise semanal de resultados e métricas do time.",
    durationMin: "60",
    recurrence: "Semanal",
    checklist: [
      { text: "Revisar KPIs da semana", required: true },
      { text: "Listar decisões abertas", required: true },
      { text: "Definir próximos passos", required: true },
    ],
  },
  "Auditoria D+1": {
    name: "Auditoria D+1",
    ritualType: "Auditoria D+1",
    area: "Financeira",
    description: "Validação diária dos resultados reportados vs dados oficiais.",
    durationMin: "30",
    recurrence: "Semanal",
    checklist: [
      { text: "Conferir torneios fora da grade", required: true },
      { text: "Registrar exceções", required: true },
    ],
  },
  "Revisão Mensal": {
    name: "Revisão Mensal",
    ritualType: "Revisão Mensal",
    area: "Operação",
    description: "Fechamento mensal com análise completa de resultados e planejamento.",
    durationMin: "90",
    recurrence: "Mensal",
    checklist: [
      { text: "Consolidar resultados do mês", required: true },
      { text: "Revisar metas e projeções", required: true },
      { text: "Planejar próximo ciclo", required: true },
    ],
  },
  "1:1 Individual": {
    name: "1:1 Individual",
    ritualType: "1:1",
    area: "Mental",
    description: "Sessão individual de acompanhamento e feedback.",
    durationMin: "45",
    recurrence: "Quinzenal",
    checklist: [
      { text: "Revisar metas pessoais", required: true },
      { text: "Discutir bloqueios", required: false },
    ],
  },
  Aula: {
    name: "Aula",
    ritualType: "Aula",
    area: "Técnica",
    description: "Aula técnica para desenvolvimento de habilidades do time.",
    durationMin: "60",
    recurrence: "Semanal",
    checklist: [
      { text: "Definir tema e objetivo de aprendizado", required: true },
      { text: "Registrar materiais / gravação", required: false },
    ],
  },
};

export const RITUAL_EMPTY_FORM = {
  name: "",
  ritualType: "",
  area: "",
  description: "",
  driId: "",
  checklist: [] as RitualChecklistItem[],
  startDate: "",
  startTime: "14:00",
  durationMin: "60",
  recurrence: "Semanal",
  generateFor: "8",
  daysOfWeek: [1] as number[],
  sendReminder: false,
  reminderLead: "15min",
  notifyDriIfLate: true,
  createGoogleCalendar: false,
};
