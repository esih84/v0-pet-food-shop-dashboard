"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { crmService } from "./crm-api";
import { queryKeys } from "@/features/query-keys";
import type { CustomerFilter } from "@/features/sms/sms-api";

export function useCrmCustomers(
  filter: CustomerFilter & { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: [...queryKeys.crmCustomers, filter],
    queryFn: () => crmService.getCustomers(filter),
    placeholderData: keepPreviousData,
  });
}

/** Segment definitions — labels, colours and ordering for the whole dashboard. */
export function useSegments() {
  return useQuery({
    queryKey: queryKeys.crmSegments,
    queryFn: crmService.getSegments,
    staleTime: 5 * 60 * 1000,
  });
}

/** Customer count per segment key, plus `unclassified`. */
export function useSegmentCounts() {
  return useQuery({
    queryKey: queryKeys.crmSegmentCounts,
    queryFn: crmService.getSegmentCounts,
    staleTime: 60 * 1000,
  });
}
