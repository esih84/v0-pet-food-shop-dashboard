"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { customerService } from "./customer-api";
import { queryKeys } from "@/features/query-keys";

export function useCustomers(page = 1, limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.customers, page, limit],
    queryFn: () => customerService.getCustomers(page, limit),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customer(id),
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
  });
}
