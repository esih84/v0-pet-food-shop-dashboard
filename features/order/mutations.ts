"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, type OrderStatus } from "./order-api";
import { queryKeys } from "@/features/query-keys";

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(id, status),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.orders });
      qc.invalidateQueries({ queryKey: queryKeys.order(variables.id) });
    },
  });
}
