"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancellationReasonService,
  type UpdateCancellationReasonInput,
} from "./cancellation-reason-api";
import { queryKeys } from "@/features/query-keys";

function useInvalidateReasons() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.cancellationReasons });
    qc.invalidateQueries({ queryKey: queryKeys.cancellationReasonStats });
  };
}

export function useCreateCancellationReason() {
  const invalidate = useInvalidateReasons();
  return useMutation({
    mutationFn: cancellationReasonService.createReason,
    onSuccess: invalidate,
  });
}

export function useUpdateCancellationReason() {
  const invalidate = useInvalidateReasons();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCancellationReasonInput;
    }) => cancellationReasonService.updateReason(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteCancellationReason() {
  const invalidate = useInvalidateReasons();
  return useMutation({
    mutationFn: cancellationReasonService.deleteReason,
    onSuccess: invalidate,
  });
}
