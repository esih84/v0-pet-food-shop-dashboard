"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { couponService } from "./coupon-api";
import { queryKeys } from "@/features/query-keys";

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponService.createCoupon,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.coupons }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponService.deleteCoupon,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.coupons }),
  });
}
