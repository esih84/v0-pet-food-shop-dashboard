"use client";

import { useQuery } from "@tanstack/react-query";
import { couponService } from "./coupon-api";
import { queryKeys } from "@/features/query-keys";

export function useCoupons(page = 1, limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.coupons, page, limit],
    queryFn: () => couponService.getCoupons(page, limit),
    staleTime: 2 * 60 * 1000,
  });
}
