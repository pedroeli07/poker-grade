import type { Metadata } from "next";

const PAGES: Record<string, { title: string; desc: string }> = {
  gradeDetail: { title: "Grade | Gestão de Grades", desc: "Regras e filtros da grade." },
  grades: { title: "Perfis de Grades", desc: "Gerencie os perfis de grades e filtros da Lobbyze." },
  importDetail: { title: "Detalhes de uma Importação", desc: "Visualize os detalhes de uma importação da Lobbyze." },
  notifications: { title: "Notificações", desc: "Visualize suas notificações e marque como lidas." },
  sharkscopeAlerts: { title: "Alertas SharkScope", desc: "Alertas de performance do SharkScope para os jogadores do time." },
  sharkscopeAnalytics: { title: "Analytics SharkScope", desc: "Análise de performance do time por rede e período. Dados do cache." },
  sharkscopeAnalyticsDebug: {
    title: "Debug Analytics SharkScope",
    desc: "Sincroniza e visualiza métricas de um jogador para comparar com o site.",
  },
  sharkscopeScouting: {
    title: "Scouting SharkScope",
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
};

const KEYS = {
  GRADES_LS_VIEW: "gestao-grades:grades:view",
  NOTIFICATIONS_LS_FILTER: "gestao-grades:notifications:filter",
  NOTIFICATIONS_LS_PAGE: "gestao-grades:notifications:page",
  SHARKSCOPE_ANALYTICS_LS_PERIOD: "gestao-grades:sharkscope-analytics:period",
  SHARKSCOPE_ANALYTICS_LS_TAB: "gestao-grades:sharkscope-analytics:tab",
  SHARKSCOPE_SCOUTING_LS_NICK: "gestao-grades:sharkscope-scouting:nick",
  SHARKSCOPE_SCOUTING_LS_NETWORK: "gestao-grades:sharkscope-scouting:network",
  SHARKSCOPE_SCOUTING_LS_NOTES: "gestao-grades:sharkscope-scouting:notes",
  SHARKSCOPE_SCOUTING_LS_NLQ: "gestao-grades:sharkscope-scouting:nlqQuestion",
  SHARKSCOPE_SCOUTING_LS_EXPANDED: "gestao-grades:sharkscope-scouting:expandedId",
  TARGETS_LS_VIEW: "gestao-grades:targets:view",
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
export const defaultMetadata = { title: "Gestão de Grades", description: "Gestão de Grades" } satisfies Metadata;

export const { GRADES_LS_VIEW, NOTIFICATIONS_LS_FILTER, NOTIFICATIONS_LS_PAGE, SHARKSCOPE_ANALYTICS_LS_PERIOD, SHARKSCOPE_ANALYTICS_LS_TAB, SHARKSCOPE_SCOUTING_LS_NICK, SHARKSCOPE_SCOUTING_LS_NETWORK, SHARKSCOPE_SCOUTING_LS_NOTES, SHARKSCOPE_SCOUTING_LS_NLQ, SHARKSCOPE_SCOUTING_LS_EXPANDED, TARGETS_LS_VIEW } = KEYS;