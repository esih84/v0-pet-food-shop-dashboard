"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmService } from "./crm-api";
import { queryKeys } from "@/features/query-keys";

export function useRecomputeRfm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmService.recomputeRfm,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.crmCustomers });
      qc.invalidateQueries({ queryKey: queryKeys.crmSegments });
    },
  });
}
