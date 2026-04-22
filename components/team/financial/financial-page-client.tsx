"use client";

import { memo } from "react";
import { FINANCIAL_DEMO_CLOSURES, FINANCIAL_DEMO_KPIS } from "@/lib/constants/team/financial-page";
import { FinancialPageHeader } from "./financial-page-header";
import { FinancialSummaryCards } from "./financial-summary-cards";
import { FinancialClosuresTable } from "./financial-closures-table";

const FinancialPageClient = memo(function FinancialPageClient() {
  return (
    <div className="space-y-6">
      <FinancialPageHeader />
      <FinancialSummaryCards items={FINANCIAL_DEMO_KPIS} />
      <FinancialClosuresTable rows={FINANCIAL_DEMO_CLOSURES} />
    </div>
  );
});

FinancialPageClient.displayName = "FinancialPageClient";

export default FinancialPageClient;
