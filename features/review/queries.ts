"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewService } from "./review-api";
import { queryKeys } from "@/features/query-keys";

export function useComments() {
  return useQuery({
    queryKey: queryKeys.reviews,
    queryFn: reviewService.getReviews,
    staleTime: 2 * 60 * 1000,
  });
}
