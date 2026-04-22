import type { TeamCultureValue } from "@/lib/types/team/identity";

/**
 * Propósito / visão / missão — referência para seed manual (ex.: `scratch/seed-culture.ts`);
 * a página de identidade lê somente o que está no banco.
 */
export const TEAM_CULTURE_DEFAULT_IDENTITY = {
  purpose:
    "Formar e potencializar jogadores de poker capazes de gerar lucro de forma consistente e a construírem carreiras sólidas e sustentáveis com foco em performance e longo prazo.",
  vision:
    "Ser o time brasileiro com maior ROI do país, conhecido por formar relações sólidas e duradouras com jogadores que crescem e prosperam junto com o time.",
  mission:
    "Selecionar, treinar e acompanhar jogadores com método, disciplina e dados, garantindo evolução técnica, mental e financeira diária.",
} as const;

/** Valores operacionais completos (UI Identidade) — mesma forma que `TeamCultureValue`. */
export const TEAM_CULTURE_VALUES_FULL: TeamCultureValue[] = [
  {
    title: "EV e ROI Alto",
    description:
      "Tomamos decisões inteligentes, maximizando EV em cada mão jogada. Buscamos consistência para manter alto ROI no longo prazo. Jogamos para vencer.",
    whatWeDo: [
      "Enviamos reporte diário até 23:59 sem exceção",
      "Cumprimos a grade definida com o coach",
      "Chegamos pontualmente nos rituais agendados",
      "Gerenciamos makeup de forma proativa",
    ].join("\n"),
    whatWeDont: [
      "Não jogamos torneios fora da grade sem aprovação",
      "Não ignoramos alertas de makeup crescente",
      "Não faltamos rituais sem aviso com 24h de antecedência",
      "Não deixamos tarefas abertas além do prazo",
    ].join("\n"),
    metrics: [
      {
        title: "ROI Médio",
        description: "ROI do jogador nos últimos 30 dias",
        source: "Reporte Diário",
      },
      {
        title: "Volume Qualificado",
        description: "Torneios jogados dentro da grade",
        source: "Integração Sharkscope",
      },
    ],
  },
  {
    title: "Disciplina",
    description:
      "Fazemos o que precisa ser feito, especialmente nos dias difíceis. Disciplina é o pilar que sustenta a lucratividade e o profissionalismo.",
    whatWeDo: [
      "Enviamos reporte diário até 23:59 sem exceção",
      "Cumprimos a grade definida com o coach",
      "Chegamos pontualmente nos rituais agendados",
      "Gerenciamos makeup de forma proativa",
    ].join("\n"),
    whatWeDont: [
      "Não jogamos torneios fora da grade sem aprovação",
      "Não ignoramos alertas de makeup crescente",
      "Não faltamos rituais sem aviso com 24h de antecedência",
      "Não deixamos tarefas abertas além do prazo",
    ].join("\n"),
    metrics: [
      {
        title: "% Reportes Enviados",
        description: "Proporção de dias com reporte enviado",
        source: "Reporte Diário",
      },
      {
        title: "Adesão à Grade",
        description: "Torneios jogados dentro da grade aprovada",
        source: "Integração Sharkscope",
      },
      {
        title: "Presença em Rituais",
        description: "Participação em WBR, 1:1, aulas",
        source: "Sistema de Rituais",
      },
    ],
  },
  {
    title: "Melhoria Contínua",
    description:
      "Evolução diária é obrigação. Estudo consistente, revisão de mãos, rotinas sólidas e aprendizado constante são a base da performance.",
    whatWeDo: [
      "Estudamos no mínimo 4 horas por semana",
      "Participamos de todas as aulas do time",
      "Revisamos mãos importantes diariamente",
      "Buscamos entender leaks recorrentes",
      "Testamos ajustes sugeridos pelo coach",
    ].join("\n"),
    whatWeDont: [
      "Não jogamos no piloto automático",
      "Não repetimos erros já identificados",
      "Não ignoramos estudos por estar \"em dia\"",
      "Não paramos de evoluir após bons resultados",
    ].join("\n"),
    metrics: [
      {
        title: "Horas de Estudo",
        description: "Horas registradas de estudo semanal",
        source: "Registro de Estudo",
      },
      {
        title: "Presença em Aulas",
        description: "% de aulas com presença confirmada",
        source: "Sistema de Rituais",
      },
      {
        title: "Reviews Realizados",
        description: "Quantidade de mãos revisadas",
        source: "Registro de Estudo",
      },
    ],
  },
  {
    title: "Autorresponsabilidade",
    description:
      "Cada jogador é responsável pela própria carreira, rotina, desempenho e evolução financeira. Sem vitimismo. Sem transferir culpa.",
    whatWeDo: [
      "Assumimos responsabilidade por decisões ruins",
      "Implementamos feedback recebido no coaching",
      "Buscamos ativamente material de estudo",
      "Cumprimos compromissos assumidos",
      "Tomamos iniciativa para resolver problemas",
    ].join("\n"),
    whatWeDont: [
      "Não culpamos variância por resultados sistemáticos",
      "Não terceirizamos responsabilidade para o coach",
      "Não esperamos que nos digam o que fazer",
      "Não justificamos falta de estudo com \"não teve tempo\"",
    ].join("\n"),
    metrics: [
      {
        title: "Tarefas Concluídas",
        description: "Taxa de conclusão de tarefas no prazo",
        source: "Gestão de Tarefas",
      },
      {
        title: "Implementação de Feedback",
        description: "Ações derivadas de 1:1 executadas",
        source: "Sistema de Rituais",
      },
    ],
  },
  {
    title: "Humildade",
    description:
      "Reconhecemos que sempre há espaço para aprender. Escutamos, ajustamos e evoluímos sem orgulho, sem justificativas e sem desculpas.",
    whatWeDo: [
      "Aceitamos feedback sem defensividade",
      "Reconhecemos erros rapidamente",
      "Pedimos ajuda quando necessário",
      "Celebramos conquistas do time",
    ].join("\n"),
    whatWeDont: [
      "Não agimos com arrogância",
      "Não ignoramos feedback construtivo",
      "Não competimos internamente de forma destrutiva",
      "Não menosprezamos colegas de equipe",
    ].join("\n"),
    metrics: [
      {
        title: "Mãos Compartilhadas",
        description: "Volume de spots enviados para review",
        source: "Registro de Estudo",
      },
      {
        title: "Feedback Implementado",
        description: "Taxa de implementação de sugestões",
        source: "Sistema de Rituais",
      },
    ],
  },
  {
    title: "Constância",
    description:
      "Jogamos com disciplina e rotina. Não buscamos picos, buscamos estabilidade. A força está em repetir o bom trabalho todo dia.",
    whatWeDo: [
      "Mantemos rotina consistente de grind",
      "Seguimos cronograma de estudo regular",
      "Mantemos hábitos saudáveis de sono e alimentação",
      "Jogamos volume consistente semanalmente",
    ].join("\n"),
    whatWeDont: [
      "Não fazemos 'maratonas' compensatórias",
      "Não variamos volume drasticamente",
      "Não negligenciamos rotinas em dias bons",
      "Não abandonamos processos por resultados de curto prazo",
    ].join("\n"),
    metrics: [
      {
        title: "Regularidade de Volume",
        description: "Variação no volume semanal",
        source: "Reporte Diário",
      },
      {
        title: "Consistência de Rotina",
        description: "Frequência em rituais ao longo do mês",
        source: "Sistema de Rituais",
      },
    ],
  },
  {
    title: "Verdade e Transparência",
    description:
      "Cultura de honestidade: dados abertos, conversas diretas e feedback real. Sem fantasia, sem narrativa para encobrir performance baixa.",
    whatWeDo: [
      "Reportamos resultados negativos com a mesma seriedade dos positivos",
      "Comunicamos dificuldades emocionais no diário",
      "Compartilhamos mãos difíceis para review",
      "Avisamos quando algo não está funcionando",
    ].join("\n"),
    whatWeDont: [
      "Não omitimos perdas ou resultados ruins",
      "Não mascaramos tilt como \"bad beat\"",
      "Não escondemos problemas de bankroll pessoal",
      "Não inventamos desculpas para faltas",
    ].join("\n"),
    metrics: [
      {
        title: "Diário Emocional Preenchido",
        description: "Qualidade do registro emocional diário",
        source: "Reporte Diário",
      },
      {
        title: "Comunicação Proativa",
        description: "Antecedência em avisos e comunicados",
        source: "Sistema de Rituais",
      },
    ],
  },
];
