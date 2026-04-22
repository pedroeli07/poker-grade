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

export const DIAS_SEMANA = [
  { value: 0, label: "D" },
  { value: 1, label: "S" },
  { value: 2, label: "T" },
  { value: 3, label: "Q" },
  { value: 4, label: "Q" },
  { value: 5, label: "S" },
  { value: 6, label: "S" },
];

export const RITUAL_TEMPLATES: Record<
  string,
  Partial<{
    name: string;
    ritualType: string;
    area: string;
    description: string;
    durationMin: string;
    recurrence: string;
    checklist: RitualChecklistItem[];
  }>
> = {
  WBR: {
    name: "WBR Semanal",
    ritualType: "WBR",
    area: "Operação",
    description: "Revisão semanal de indicadores e decisões do time.",
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
    area: "Operação",
    description: "Conferência de torneios do dia anterior e desvios de grade.",
    durationMin: "30",
    recurrence: "Semanal",
    checklist: [
      { text: "Conferir torneios fora da grade", required: true },
      { text: "Registrar exceções", required: true },
    ],
  },
  "1:1": {
    name: "1:1",
    ritualType: "1:1",
    area: "Mental",
    description: "Conversa individual entre coach e jogador.",
    durationMin: "45",
    recurrence: "Quinzenal",
    checklist: [
      { text: "Revisar metas pessoais", required: true },
      { text: "Discutir bloqueios", required: false },
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
  daysOfWeek: [1] as number[],
  sendReminder: false,
  reminderLead: "15min",
  notifyDriIfLate: true,
};
