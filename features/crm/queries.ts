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

export function useSegments() {
  return useQuery({
    queryKey: queryKeys.crmSegments,
    queryFn: crmService.getSegments,
    staleTime: 60 * 1000,
  });
}

export function useRfmSettings() {
  return useQuery({
    queryKey: queryKeys.crmRfmSettings,
    queryFn: crmService.getRfmSettings,
    staleTime: 5 * 60 * 1000,
  });
}
