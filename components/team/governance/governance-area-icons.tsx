"use client";

import { Brain, Layout, Shield, User, Wallet } from "lucide-react";

export const GOVERNANCE_AREA_ICONS: Record<string, React.ReactNode> = {
  Técnica: <Shield className="h-4 w-4 text-blue-500" />,
  Mental: <Brain className="h-4 w-4 text-purple-500" />,
  Financeiro: <Wallet className="h-4 w-4 text-emerald-500" />,
  Financeira: <Wallet className="h-4 w-4 text-emerald-500" />,
  Grades: <Layout className="h-4 w-4 text-orange-500" />,
  Cultura: <User className="h-4 w-4 text-pink-500" />,
  Geral: <User className="h-4 w-4 text-slate-500" />,
  Operação: <Layout className="h-4 w-4 text-cyan-500" />,
};
