/** Quiz e fluxo de onboarding cultural (UI admin / time). */

export type OnboardingQuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  /** Exibida só quando o usuário acerta a pergunta (não revela resposta após erro). */
  explanation: string;
};

export const ONBOARDING_QUIZ_QUESTIONS: OnboardingQuizQuestion[] = [
  {
    id: 1,
    question: "Qual é o prazo máximo para envio do reporte diário?",
    options: ["21:00", "22:00", "23:59", "Não há prazo definido"],
    correctAnswer: "23:59",
    explanation: "O reporte deve ser enviado até 23:59 do mesmo dia, sem exceções.",
  },
  {
    id: 2,
    question: "O que acontece se você jogar torneios fora da sua grade sem aprovação?",
    options: [
      "Nada, é só uma recomendação",
      "Esses torneios não entram no cálculo de bônus",
      "Você é automaticamente desligado",
      "Recebe um aviso informal",
    ],
    correctAnswer: "Esses torneios não entram no cálculo de bônus",
    explanation: "Torneios fora da grade não contam para bônus e reincidência pode resultar em redução de ABI.",
  },
  {
    id: 3,
    question: "Quantas horas de estudo semanal são recomendadas?",
    options: ["1 hora", "2 horas", "4 horas", "Não há recomendação"],
    correctAnswer: "4 horas",
    explanation: "Mínimo de 4 horas semanais. Jogadores que estudam consistentemente têm ROI 3–5pp maior.",
  },
  {
    id: 4,
    question: "Qual é o limite de makeup que dispara plano de recuperação obrigatório?",
    options: ["$1.000", "$2.000", "$3.000", "$5.000"],
    correctAnswer: "$3.000",
    explanation: "Acima de $3.000 de makeup, um plano de recuperação é obrigatório.",
  },
  {
    id: 5,
    question: "Com quanto tempo de antecedência você deve avisar sobre ausência em rituais?",
    options: ["1 hora", "12 horas", "24 horas", "48 horas"],
    correctAnswer: "24 horas",
    explanation: "Ausências devem ser comunicadas com pelo menos 24 horas de antecedência.",
  },
  {
    id: 6,
    question: 'O que significa "Transparência" na cultura do time?',
    options: [
      "Compartilhar apenas os bons resultados",
      "Esconder problemas amplifica problemas - tudo aberto, sempre",
      "Ser transparente apenas com o coach",
      "Postar resultados nas redes sociais",
    ],
    correctAnswer: "Esconder problemas amplifica problemas - tudo aberto, sempre",
    explanation:
      "Transparência significa que resultados, erros e dificuldades devem ser sempre comunicados abertamente.",
  },
];

export const ONBOARDING_STEP_LABELS = [
  "1. Leitura",
  "2. Aceite",
  "3. Quiz",
  "4. Liberação",
] as const;

export const ONBOARDING_COMMITMENTS = [
  "Enviar reporte diário até 23:59 sem exceções",
  "Cumprir minha grade de torneios conforme definido",
  "Participar de todos os rituais agendados (WBR, 1:1, aulas)",
  "Ser transparente sobre resultados e dificuldades",
  "Aceitar as consequências definidas para quebras de regra",
] as const;
