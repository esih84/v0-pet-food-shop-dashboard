"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmService, type RfmSegmentInput } from "./crm-api";
import { queryKeys } from "@/features/query-keys";

/**
 * Anything that changes segment rules also re-labels customers on the server, so the
 * customer list and the counts are just as stale afterwards as the definitions are.
 */
function useSegmentInvalidation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.crmSegments });
    qc.invalidateQueries({ queryKey: queryKeys.crmSegmentCounts });
    qc.invalidateQueries({ queryKey: queryKeys.crmCustomers });
  };
}

export function useRecomputeRfm() {
  const invalidate = useSegmentInvalidation();
  return useMutation({
    mutationFn: crmService.recomputeRfm,
    onSuccess: invalidate,
  });
}

export function useCreateSegment() {
  const invalidate = useSegmentInvalidation();
  return useMutation({
    mutationFn: (input: RfmSegmentInput) => crmService.createSegment(input),
    onSuccess: invalidate,
  });
}

export function useUpdateSegment() {
  const invalidate = useSegmentInvalidation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RfmSegmentInput }) =>
      crmService.updateSegment(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteSegment() {
  const invalidate = useSegmentInvalidation();
  return useMutation({
    mutationFn: (id: string) => crmService.deleteSegment(id),
    onSuccess: invalidate,
  });
}

export function useReorderSegments() {
  const invalidate = useSegmentInvalidation();
  return useMutation({
    mutationFn: (ids: string[]) => crmService.reorderSegments(ids),
    onSuccess: invalidate,
  });
}
