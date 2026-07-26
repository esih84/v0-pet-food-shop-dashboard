"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  cancellationReasonService,
  type ReasonStatsRange,
} from "./cancellation-reason-api";
import { queryKeys } from "@/features/query-keys";

export function useCancellationReasons(page = 1, limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.cancellationReasons, page, limit],
    queryFn: () => cancellationReasonService.getReasons(page, limit),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useActiveCancellationReasons() {
  return useQuery({
    queryKey: queryKeys.activeCancellationReasons,
    queryFn: cancellationReasonService.getActiveReasons,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReasonStats(range: ReasonStatsRange) {
  return useQuery({
    queryKey: [...queryKeys.cancellationReasonStats, range.from, range.to],
    queryFn: () => cancellationReasonService.getStats(range),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
