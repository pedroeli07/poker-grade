"use client";

import { useMemo } from "react";
import type { GradeRuleCardRule } from "@/lib/types";
import {
  getRuleDisplayMeta,
  getVisibleRuleFieldRows,
} from "@/lib/utils/grade-rule-display";

export function useRuleDisplay(rule: GradeRuleCardRule) {
  return useMemo(
    () => ({
      meta: getRuleDisplayMeta(rule),
      fieldRows: getVisibleRuleFieldRows(rule),
    }),
    [rule]
  );
}
