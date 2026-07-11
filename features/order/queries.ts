"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { orderService } from "./order-api";
import { queryKeys } from "@/features/query-keys";

export function useOrders(page = 1, limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.orders, page, limit],
    queryFn: () => orderService.getOrders(page, limit),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  });
}

export function useUserOrders(userId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.userOrders(userId), page, limit],
    queryFn: () => orderService.getUserOrders(userId, page, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}
