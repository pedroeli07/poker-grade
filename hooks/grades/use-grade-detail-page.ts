"use client";

import { useQuery } from "@tanstack/react-query";
import { getGradeDetailQueryAction } from "@/lib/queries/db/grade";
import { gradeKeys } from "@/lib/queries/grade-query-keys";
import type { GradeDetailQueryData } from "@/lib/types";
import { STALE_TIME } from "@/lib/constants";

export function useGradeDetailPage(
  gradeId: string,
  initialData: GradeDetailQueryData
) {
  const { data = initialData } = useQuery<GradeDetailQueryData>({
    queryKey: gradeKeys.detail(gradeId),
    queryFn: async () => {
      const r = await getGradeDetailQueryAction(gradeId);
      if (!r.ok) throw new Error(r.error);
      return r.data;
    },
    initialData,
    staleTime: STALE_TIME,
  });

  return { data };
}
