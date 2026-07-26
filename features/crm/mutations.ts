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

/** Saving thresholds recomputes segments on the server, so the lists are invalidated too. */
export function useUpdateRfmSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmService.updateRfmSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.crmRfmSettings });
      qc.invalidateQueries({ queryKey: queryKeys.crmCustomers });
      qc.invalidateQueries({ queryKey: queryKeys.crmSegments });
    },
  });
}
