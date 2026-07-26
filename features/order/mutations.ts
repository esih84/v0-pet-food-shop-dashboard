"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, type OrderStatus } from "./order-api";
import { queryKeys } from "@/features/query-keys";

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      cancellationReasonId,
    }: {
      id: string;
      status: OrderStatus;
      cancellationReasonId?: string;
    }) => orderService.updateOrderStatus(id, status, cancellationReasonId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.orders });
      qc.invalidateQueries({ queryKey: queryKeys.order(variables.id) });
    },
  });
}
