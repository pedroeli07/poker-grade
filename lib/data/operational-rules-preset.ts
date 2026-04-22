import {
  RULE_TYPE_MANDATORY,
  RULE_TYPE_RECOMMENDATION,
} from "@/lib/constants/team/rule-type";
import {
  SEVERITY_CRITICAL,
  SEVERITY_INFO,
  SEVERITY_WARNING,
} from "@/lib/constants/team/severity";

/**
 * Regras e recomendações alinhadas ao módulo de identidade (CL Admin).
 * `type` = MANDATORY | RECOMMENDATION; `severity` = códigos em inglês.
 */
export const OPERATIONAL_RULES_PRESET = [
  {
    title: "Reporte Diário Obrigatório",
    type: RULE_TYPE_MANDATORY,
    monitoring: true,
    description:
      "Sem dados diários, não há como identificar leaks, gerenciar makeup ou prevenir tilt acumulado. Cada dia sem reporte é um dia de gestão cega.",
    severity: SEVERITY_CRITICAL,
    source: "Sistema de Reportes",
    limit: "3 faltas em 30 dias",
    consequence: "Suspensão temporária da grade até regularização",
  },
  {
    title: "Cumprimento da Grade",
    type: RULE_TYPE_MANDATORY,
    monitoring: true,
    description:
      "A grade é calibrada para o nível técnico e bankroll do jogador. Desvios geram risco não calculado e prejudicam a gestão do time.",
    severity: SEVERITY_WARNING,
    source: "Integração Sharkscope",
    limit: "",
    consequence:
      "Torneios fora da grade não entram no cálculo de bônus. Reincidência pode resultar em redução de ABI.",
  },
  {
    title: "Presença em Rituais",
    type: RULE_TYPE_MANDATORY,
    monitoring: true,
    description:
      "Rituais são o mecanismo de accountability e correção de rota do time. Sem participação, o jogador perde o loop de melhoria.",
    severity: SEVERITY_WARNING,
    source: "Sistema de Rituais",
    limit: "Ausência sem aviso 24h antes",
    consequence: "Ausências sem justificativa afetam elegibilidade ao bônus trimestral.",
  },
  {
    title: "Gestão de Makeup",
    type: RULE_TYPE_MANDATORY,
    monitoring: true,
    description:
      "Makeup não gerenciado é risco financeiro para o time. Acima de certos patamares, o jogador pode estar jogando em viés psicológico.",
    severity: SEVERITY_CRITICAL,
    source: "Sistema Financeiro",
    limit: "Makeup > $3.000",
    consequence:
      "Plano de recuperação obrigatório. Redução de ABI se não estabilizar em 30 dias.",
  },
  {
    title: "Comunicação Antecipada",
    type: RULE_TYPE_MANDATORY,
    monitoring: false,
    description:
      "Surpresas geram retrabalho e decisões ruins. Antecipação permite planejamento e suporte adequado.",
    severity: SEVERITY_INFO,
    source: "",
    limit: "",
    consequence: "Problemas não comunicados com antecedência não geram suporte especial.",
  },
  {
    title: "Estudo Semanal Mínimo",
    type: RULE_TYPE_RECOMMENDATION,
    monitoring: true,
    description:
      "Jogadores que estudam consistentemente têm ROI 3-5pp maior. Estudo é o edge mais controlável no poker.",
    severity: SEVERITY_WARNING,
    source: "Registro de Estudo",
    limit: "Menos de 4h por semana",
    consequence:
      "Sem consequência direta, mas impacta avaliação de evolução e prioridade para promoção de stakes.",
  },
  {
    title: "Diário Emocional no Reporte",
    type: RULE_TYPE_RECOMMENDATION,
    monitoring: false,
    description:
      "Dados emocionais permitem coaches identificar padrões de tilt antes que causem perdas significativas.",
    severity: SEVERITY_INFO,
    source: "Reporte Diário",
    limit: "",
    consequence: "Sem consequência direta, mas melhora qualidade do coaching e suporte.",
  },
] as const;
