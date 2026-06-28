"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "./review-api";
import { queryKeys } from "@/features/query-keys";

export function useApproveReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewService.approveReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.reviews }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewService.deleteReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.reviews }),
  });
}
