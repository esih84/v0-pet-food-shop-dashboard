"use client";

import { useQuery } from "@tanstack/react-query";
import { customerService } from "./customer-api";
import { queryKeys } from "@/features/query-keys";

export function useCustomers(page = 1, limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.customers, page, limit],
    queryFn: () => customerService.getCustomers(page, limit),
    staleTime: 2 * 60 * 1000,
  });
}
