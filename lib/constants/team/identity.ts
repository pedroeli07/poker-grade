import {
  Activity,
  AlertCircle,
  BadgeInfo,
  BookHeart,
  CheckCircle2,
  Compass,
  Eye,
  GraduationCap,
  Heart,
  Infinity as InfinityIcon,
  Shield,
  ShieldAlert,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { TeamCultureValue } from "@/lib/types/team/identity";
import {
  RULE_TYPE_MANDATORY,
  RULE_TYPE_RECOMMENDATION,
  type RuleType,
} from "@/lib/constants/team/rule-type";
import { SEVERITY_NONE } from "@/lib/constants/team/severity";

export const SECTION_CONFIG = [
  {
    key: "purpose" as const,
    label: "Propósito",
    icon: Target,
    description: "Qual é a razão de existir do time?",
  },
  {
    key: "vision" as const,
    label: "Visão",
    icon: Eye,
    description: "Onde queremos chegar no futuro?",
  },
  {
    key: "mission" as const,
    label: "Missão",
    icon: Compass,
    description: "Como atuamos para alcançar nossa visão?",
  },
];

/** Main page tab definitions (labels stay PT for the UI). */
export const IDENTITY_PAGE_TABS = [
  { value: "identidade", label: "Identidade Central", icon: BookHeart },
  { value: "valores", label: "Valores", icon: null as LucideIcon | null },
  { value: "regras", label: "Regras", icon: null as LucideIcon | null },
  { value: "cultura-acao", label: "Cultura em Ação", icon: Activity },
  { value: "onboarding", label: "Onboarding", icon: GraduationCap },
] as const;

export const RULE_STYLE_BY_TYPE = {
  [RULE_TYPE_MANDATORY]: {
    border: "border-l-rose-500",
    icon: ShieldAlert,
    iconBg: "bg-rose-50 text-rose-600",
    badge: "bg-rose-500 text-white",
    badgeLabel: "REGRA",
    consecBg: "bg-rose-50/70 border-rose-100 text-rose-900",
  },
  [RULE_TYPE_RECOMMENDATION]: {
    border: "border-l-sky-500",
    icon: BookHeart,
    iconBg: "text-sky-600 bg-sky-50",
    badge: "bg-sky-500 text-white",
    badgeLabel: "RECOMENDAÇÃO",
    consecBg: "bg-sky-50/70 border-sky-100 text-sky-900",
  },
} as const;

export type { RuleType };

export const TIPO_OPTIONS = [
  {
    value: RULE_TYPE_MANDATORY,
    label: "Obrigatória",
    icon: ShieldAlert,
    active: "bg-rose-500/10 border-rose-500/60 text-rose-600 hover:bg-rose-500/15",
  },
  {
    value: RULE_TYPE_RECOMMENDATION,
    label: "Recomendação",
    icon: BadgeInfo,
    active: "bg-sky-500/10 border-sky-500/60 text-sky-600 hover:bg-sky-500/15",
  },
] as const;

export const META_FIELDS = [
  { key: "source" as const, label: "Fonte", placeholder: "ex.: SharkScope" },
  { key: "limit" as const, label: "Limite", placeholder: "ex.: 3 faltas em 30 dias" },
] as const;

/** Rotating icons for each value card on the identity page. */
export const VALUE_ENTRY_ICONS: LucideIcon[] = [
  TrendingUp,
  CheckCircle2,
  BookHeart,
  Target,
  AlertCircle,
  Zap,
  Shield,
  Heart,
  InfinityIcon,
  Eye,
];

/** Tailwind classes for value card icon circles. */
export const VALUE_ENTRY_COLOR_CLASSES: string[] = [
  "text-blue-600 bg-blue-100",
  "text-indigo-600 bg-indigo-100",
  "text-purple-600 bg-purple-100",
  "text-emerald-600 bg-emerald-100",
  "text-orange-600 bg-orange-100",
  "text-amber-600 bg-amber-100",
  "text-cyan-600 bg-cyan-100",
  "text-rose-600 bg-rose-100",
];

export const EMPTY_RULE_FORM: {
  title: string;
  description: string;
  type: RuleType;
  monitoring: boolean;
  severity: string;
  source: string;
  limit: string;
  consequence: string;
} = {
  title: "",
  description: "",
  type: RULE_TYPE_MANDATORY,
  monitoring: false,
  severity: SEVERITY_NONE,
  source: "",
  limit: "",
  consequence: "",
};

export const EMPTY_VALOR: TeamCultureValue = {
  title: "",
  description: "",
  whatWeDo: "",
  whatWeDont: "",
  metrics: [],
};
