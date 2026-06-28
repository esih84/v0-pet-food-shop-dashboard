"use client";

import { useQuery } from "@tanstack/react-query";
import { orderService } from "./order-api";
import { queryKeys } from "@/features/query-keys";

export function useOrders(page = 1, limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.orders, page, limit],
    queryFn: () => orderService.getOrders(page, limit),
    staleTime: 2 * 60 * 1000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  });
}
