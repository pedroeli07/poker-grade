import type { Metadata } from "next";

const PAGES: Record<string, { title: string; desc: string }> = {
  gradeDetail: { title: "Grade | Gestão de Grades", desc: "Regras e filtros da grade." },
  grades: { title: "Perfis de Grades", desc: "Gerencie os perfis de grades da Lobbyze." },
  importDetail: { title: "Detalhes de uma Importação", desc: "Visualize os detalhes de uma importação da Lobbyze." },
  notifications: { title: "Notificações", desc: "Visualize suas notificações e marque como lidas." },
  sharkscopeAlerts: { title: "Alertas SharkScope", desc: "Alertas de performance do SharkScope para os jogadores do time." },
  sharkscopeAnalytics: { title: "Analytics SharkScope", desc: "Análise de performance do time por rede e período. Dados do cache." },
  sharkscopeAnalyticsDebug: {
    title: "Debug Analytics SharkScope",
    desc: "Sincroniza e visualiza métricas de um jogador para comparar com o site.",
  },
  sharkscopeScouting: {
    title: "Avaliação SharkScope",
    desc: "Pesquise jogadores avulsos para avaliação de contratação.",
  },
  targets: { title: "Targets e Metas", desc: "Acompanhe ABI, ROI, Volume e gatilhos de subida/descida de limite." },
  history: { title: "Histórico de Limites", desc: "Visualize o histórico de subidas, manutenções e descidas de grade dos jogadores." },
  imports: { title: "Importações", desc: "Histórico de arquivos de torneios da Lobbyze importados no sistema." },
  minhaGrade: { title: "Minha Grade", desc: "Visualize sua grade atual e histórico de subidas, manutenções e descidas." },
  playerProfile: { title: "Detalhes de um Jogador", desc: "Visualize os detalhes de um jogador e suas grades, targets e histórico de limites." },
  players: { title: "Jogadores", desc: "Gerencie o time de jogadores e aloque coaches responsáveis." },
  profile: { title: "Meu Perfil", desc: "Gerencie suas informações pessoais e credenciais" },
  review: { title: "Conferência de Torneios", desc: "Torneios extra-play e suspeitos aguardando decisão do coach." },
  users: { title: "Usuários", desc: "Gerencie os usuários do sistema e suas permissões." },
  dashboard: { title: "Dashboard", desc: "Visão geral do time de jogadores." },
  forgotPassword: { title: "Recuperar Senha | Gestão de Grades", desc: "Redefina a sua senha." },
  login: { title: "Login | Gestão de Grades", desc: "Acesse sua conta" },
  register: { title: "Cadastro | Gestão de Grades", desc: "Crie sua conta" },
  error: { title: "Erro", desc: "Algo deu errado. Tente novamente." },
  notFound: { title: "Página não encontrada | Gestão de Grades", desc: "A página que você tentou acessar não existe." },
  dashboardJogador: { title: "Início | Jogador", desc: "Resumo da sua grade, torneios, metas e notificações." },
  identity: { title: "Identidade & Regras | Time", desc: "Cultura operacional do time — auditável, mensurável e integrada aos rituais." },
  rituals: { title: "Rituais | Time", desc: "Calendário, execução e acompanhamento de rituais do time." },
  execution: { title: "Execução | Time", desc: "Tarefas, prioridades e acompanhamento de planos de ação do time." },
  teamFinancial: { title: "Financeiro | Time", desc: "Visão de caixa, repasses, makeup e custos operacionais do time." },
  teamGovernance: { title: "Governança | Time", desc: "Matriz DRI, fluxo de decisão e histórico de deliberações." },
  teamIndicators: { title: "Indicadores | Time", desc: "KPIs de resultado e processo, analytics e catálogo de métricas." },
};

const KEYS = {
  GRADES_LS_VIEW: "gestao-grades:grades:view",
  NOTIFICATIONS_LS_FILTER: "gestao-grades:notifications:filter",
  NOTIFICATIONS_LS_PAGE: "gestao-grades:notifications:page",
  NOTIFICATIONS_LS_PAGE_SIZE: "gestao-grades:notifications:pageSize",
  NOTIFICATIONS_LS_VIEW_MODE: "gestao-grades:notifications:viewMode",
  SHARKSCOPE_ANALYTICS_LS_PERIOD: "gestao-grades:sharkscope-analytics:period",
  SHARKSCOPE_ANALYTICS_LS_TAB: "gestao-grades:sharkscope-analytics:tab",
  SHARKSCOPE_SCOUTING_LS_NICK: "gestao-grades:sharkscope-scouting:nick",
  SHARKSCOPE_SCOUTING_LS_NETWORK: "gestao-grades:sharkscope-scouting:network",
  SHARKSCOPE_SCOUTING_LS_NOTES: "gestao-grades:sharkscope-scouting:notes",
  SHARKSCOPE_SCOUTING_LS_NLQ: "gestao-grades:sharkscope-scouting:nlqQuestion",
  SHARKSCOPE_SCOUTING_LS_EXPANDED: "gestao-grades:sharkscope-scouting:expandedId",
  TARGETS_LS_VIEW: "gestao-grades:targets:view",
  DASHBOARD_JOGADOR_LS_VIEW: "gestao-grades:dashboard-jogador:view",
  IDENTITY_LS_VIEW: "gestao-grades:identity:view",
  /** Histórico de deliberações (governança): cards | table */
  GOVERNANCE_HISTORICAL_LS_VIEW: "gestao-grades:governance:historical:view",
  /** Tamanho de página (5, 10, …, “todos” em 10_000) — alinhado a notificações */
  GOVERNANCE_HISTORICAL_LS_PAGE_SIZE: "gestao-grades:governance:historical:pageSize",
  /** Regras de alerta (governança): cards | table */
  GOVERNANCE_ALERT_RULES_LS_VIEW: "gestao-grades:governance:alertRules:view",
  GOVERNANCE_ALERT_RULES_LS_PAGE_SIZE: "gestao-grades:governance:alertRules:pageSize",
};

const toMetadata = (p: { title: string; desc: string }) => ({ title: p.title, description: p.desc } satisfies Metadata);

export const gradeDetailFallbackMetadata = toMetadata(PAGES.gradeDetail);
export const gradesPageMetadata = toMetadata(PAGES.grades);
export const importDetailPageMetadata = toMetadata(PAGES.importDetail);
export const notificationsPageMetadata = toMetadata(PAGES.notifications);
export const sharkscopeAlertsPageMetadata = toMetadata(PAGES.sharkscopeAlerts);
export const sharkscopeAnalyticsPageMetadata = toMetadata(PAGES.sharkscopeAnalytics);
export const sharkscopeAnalyticsDebugPageMetadata = toMetadata(PAGES.sharkscopeAnalyticsDebug);
export const sharkscopeScoutingPageMetadata = toMetadata(PAGES.sharkscopeScouting);
export const targetsPageMetadata = toMetadata(PAGES.targets);
export const historyPageMetadata = toMetadata(PAGES.history);
export const importsPageMetadata = toMetadata(PAGES.imports);
export const minhaGradePageMetadata = toMetadata(PAGES.minhaGrade);
export const playerProfilePageMetadata = toMetadata(PAGES.playerProfile);
export const playersPageMetadata = toMetadata(PAGES.players);
export const profilePageMetadata = toMetadata(PAGES.profile);
export const reviewPageMetadata = toMetadata(PAGES.review);
export const usersPageMetadata = toMetadata(PAGES.users);
export const dashboardPageMetadata = toMetadata(PAGES.dashboard);
export const forgotPasswordPageMetadata = toMetadata(PAGES.forgotPassword);
export const loginPageMetadata = toMetadata(PAGES.login);
export const registerPageMetadata = toMetadata(PAGES.register);
export const errorPageMetadata = toMetadata(PAGES.error);
export const notFoundPageMetadata = toMetadata(PAGES.notFound);
export const defaultMetadata = { title: "Gestão de Grades", description: "Gestão de Grades" } satisfies Metadata;
export const dashboardJogadorPageMetadata = toMetadata(PAGES.dashboardJogador);
export const identityPageMetadata = toMetadata(PAGES.identity);
export const ritualsPageMetadata = toMetadata(PAGES.rituals);
export const executionPageMetadata = toMetadata(PAGES.execution);
export const teamFinancialPageMetadata = toMetadata(PAGES.teamFinancial);
export const teamGovernancePageMetadata = toMetadata(PAGES.teamGovernance);
export const teamIndicatorsPageMetadata = toMetadata(PAGES.teamIndicators);

export const {
  GRADES_LS_VIEW,
  NOTIFICATIONS_LS_FILTER,
  NOTIFICATIONS_LS_PAGE,
  NOTIFICATIONS_LS_PAGE_SIZE,
  NOTIFICATIONS_LS_VIEW_MODE,
  SHARKSCOPE_ANALYTICS_LS_PERIOD,
  SHARKSCOPE_ANALYTICS_LS_TAB,
  SHARKSCOPE_SCOUTING_LS_NICK,
  SHARKSCOPE_SCOUTING_LS_NETWORK,
  SHARKSCOPE_SCOUTING_LS_NOTES,
  SHARKSCOPE_SCOUTING_LS_NLQ,
  SHARKSCOPE_SCOUTING_LS_EXPANDED,
  TARGETS_LS_VIEW,
  GOVERNANCE_HISTORICAL_LS_VIEW,
  GOVERNANCE_HISTORICAL_LS_PAGE_SIZE,
  GOVERNANCE_ALERT_RULES_LS_VIEW,
  GOVERNANCE_ALERT_RULES_LS_PAGE_SIZE,
} = KEYS;